const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const isCheckOnly = process.argv.includes("--check");

function isSupportedVersion(version) {
  const match = /^(\d+)\.(\d+)/.exec(version);
  if (!match) {
    return true;
  }

  const major = Number(match[1]);
  const minor = Number(match[2]);

  return major > 5 || (major === 5 && minor >= 6);
}

function normalizeLegacyMySql(sql) {
  return sql
    .replace(/DATETIME\(3\)/g, "DATETIME")
    .replace(/CURRENT_TIMESTAMP\(3\)/g, "CURRENT_TIMESTAMP")
    .replace(/\bBOOLEAN\b/g, "TINYINT(1)")
    .replace(/DEFAULT false/g, "DEFAULT 0")
    .replace(/DEFAULT true/g, "DEFAULT 1");
}

function splitStatements(sql) {
  return sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function main() {
  const versionRows = await prisma.$queryRawUnsafe("SELECT VERSION() AS version");
  const version = versionRows[0]?.version || "unknown";
  const tableRows = await prisma.$queryRawUnsafe("SHOW TABLES");

  console.log(`Connected to MySQL ${version}`);
  console.log(`Existing tables: ${tableRows.length}`);

  if (!isSupportedVersion(version)) {
    throw new Error(
      `This database is running MySQL ${version}. Prisma requires MySQL 5.6+; freesqldatabase.com's 5.5 plan is too old for Prisma schema commands and this app's migration SQL.`
    );
  }

  if (isCheckOnly) {
    return;
  }

  if (tableRows.length > 0) {
    console.log(`Database already has ${tableRows.length} table(s). Skipping legacy bootstrap.`);
    return;
  }

  const migrationPath = path.join(__dirname, "migrations", "20260504000000_init", "migration.sql");
  const migrationSql = fs.readFileSync(migrationPath, "utf8");
  const normalizedSql = normalizeLegacyMySql(migrationSql);
  const statements = splitStatements(normalizedSql);

  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }

  console.log(`Legacy MySQL bootstrap finished with ${statements.length} statements.`);
}

main()
  .catch((error) => {
    if (isCheckOnly) {
      console.error("Database compatibility check failed.");
    } else {
      console.error("Database bootstrap failed.");
    }
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
