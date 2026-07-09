const { ensureRuntimeEnv } = require("../config/runtime-env.cjs");
const { PrismaClient } = require("@prisma/client");

ensureRuntimeEnv("backend");

const prisma = new PrismaClient();
const isCheckOnly = process.argv.includes("--check");

async function main() {
  const databaseUrl = process.env.DATABASE_URL || "";
  if (!databaseUrl.startsWith("mongodb")) {
    throw new Error("DATABASE_URL must point to MongoDB.");
  }

  await prisma.$connect();
  await prisma.$runCommandRaw({ ping: 1 });

  console.log("Connected to MongoDB successfully.");

  if (isCheckOnly) {
    return;
  }

  console.log("Pushing Prisma schema to MongoDB...");
}

main()
  .catch((error) => {
    console.error("MongoDB setup check failed.");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
