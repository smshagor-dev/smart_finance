const fs = require("fs");
const path = require("path");
const { ensureRuntimeEnv } = require("../config/runtime-env.cjs");
const { PrismaClient } = require("@prisma/client");

ensureRuntimeEnv("backend");

const prisma = new PrismaClient();
const dumpPath = path.join(__dirname, "..", "smart_finance.sql");

const CLEAR_ORDER = [
  "account",
  "session",
  "verificationToken",
  "receipt",
  "notification",
  "groupMessage",
  "financeGroupInvite",
  "financeGroupMember",
  "financeGroup",
  "exportLog",
  "aIInsight",
  "savingsContribution",
  "savingsGoal",
  "debtPayment",
  "debtLoan",
  "recurringPayment",
  "budget",
  "transaction",
  "wallet",
  "category",
  "userSetting",
  "auditLog",
  "authProviderSetting",
  "customPage",
  "siteSetting",
  "user",
  "currency",
];

const TABLE_CONFIG = {
  accounts: {
    delegate: "account",
    transform: (record) =>
      renameKeys(record, {
        user_id: "userId",
        provider_account_id: "providerAccountId",
      }),
  },
  audit_logs: {
    delegate: "auditLog",
    transform: (record) =>
      transformRecord(
        renameKeys(record, {
          actor_user_id: "actorUserId",
          entity_type: "entityType",
          entity_id: "entityId",
          ip_address: "ipAddress",
          created_at: "createdAt",
        }),
        {
          json: ["meta"],
          dates: ["createdAt"],
        },
      ),
  },
  auth_provider_settings: {
    delegate: "authProviderSetting",
    transform: (record) =>
      transformRecord(
        renameKeys(record, {
          client_id: "clientId",
          client_secret: "clientSecret",
          bot_token: "botToken",
          callback_url: "callbackUrl",
          success_redirect_url: "successRedirectUrl",
          failure_redirect_url: "failureRedirectUrl",
          config_json: "configJson",
          is_enabled: "isEnabled",
          created_at: "createdAt",
          updated_at: "updatedAt",
        }),
        {
          booleans: ["isEnabled"],
          json: ["configJson"],
          dates: ["createdAt", "updatedAt"],
        },
      ),
  },
  Category: {
    delegate: "category",
    transform: (record) =>
      transformRecord(
        renameKeys(record, {
          user_id: "userId",
          is_default: "isDefault",
          created_at: "createdAt",
          updated_at: "updatedAt",
        }),
        {
          booleans: ["isDefault"],
          dates: ["createdAt", "updatedAt"],
        },
      ),
  },
  currencies: {
    delegate: "currency",
    transform: (record) =>
      transformRecord(
        renameKeys(record, {
          exchange_rate_to_usd: "exchangeRateToUsd",
          is_active: "isActive",
          last_synced_at: "lastSyncedAt",
          created_at: "createdAt",
          updated_at: "updatedAt",
        }),
        {
          booleans: ["isActive"],
          numbers: ["exchangeRateToUsd"],
          dates: ["lastSyncedAt", "createdAt", "updatedAt"],
        },
      ),
  },
  custom_pages: {
    delegate: "customPage",
    transform: (record) =>
      transformRecord(
        renameKeys(record, {
          short_description: "shortDescription",
          meta_title: "metaTitle",
          meta_description: "metaDescription",
          meta_keywords: "metaKeywords",
          created_at: "createdAt",
          updated_at: "updatedAt",
          published_at: "publishedAt",
        }),
        {
          dates: ["createdAt", "updatedAt", "publishedAt"],
        },
      ),
  },
  Notification: {
    delegate: "notification",
    transform: (record) =>
      transformRecord(
        renameKeys(record, {
          user_id: "userId",
          is_read: "isRead",
          action_url: "actionUrl",
          created_at: "createdAt",
        }),
        {
          booleans: ["isRead"],
          dates: ["createdAt"],
        },
      ),
  },
  site_settings: {
    delegate: "siteSetting",
    transform: (record) =>
      transformRecord(
        renameKeys(record, {
          site_name: "siteName",
          site_tagline: "siteTagline",
          site_description: "siteDescription",
          seo_title: "seoTitle",
          seo_description: "seoDescription",
          seo_keywords: "seoKeywords",
          logo_url: "logoUrl",
          icon_url: "iconUrl",
          support_email: "supportEmail",
          site_url: "siteUrl",
          smtp_host: "smtpHost",
          smtp_port: "smtpPort",
          smtp_secure: "smtpSecure",
          smtp_user: "smtpUser",
          smtp_pass: "smtpPass",
          smtp_from: "smtpFrom",
          require_email_verification: "requireEmailVerification",
          verification_code_expiry_minutes: "verificationCodeExpiryMinutes",
          created_at: "createdAt",
          updated_at: "updatedAt",
        }),
        {
          booleans: ["smtpSecure", "requireEmailVerification"],
          numbers: ["smtpPort", "verificationCodeExpiryMinutes"],
          dates: ["createdAt", "updatedAt"],
        },
      ),
  },
  Transaction: {
    delegate: "transaction",
    transform: (record) =>
      transformRecord(
        renameKeys(record, {
          user_id: "userId",
          group_id: "groupId",
          original_amount: "originalAmount",
          converted_amount: "convertedAmount",
          category_id: "categoryId",
          wallet_id: "walletId",
          transaction_date: "transactionDate",
          payment_method: "paymentMethod",
          attachment_url: "attachmentUrl",
          currency_id: "currencyId",
          exchange_rate: "exchangeRate",
          income_source: "incomeSource",
          created_at: "createdAt",
          updated_at: "updatedAt",
        }),
        {
          numbers: ["amount", "originalAmount", "convertedAmount", "exchangeRate"],
          dates: ["transactionDate", "createdAt", "updatedAt"],
        },
      ),
  },
  users: {
    delegate: "user",
    transform: (record) =>
      unsetNullFields(
        transformRecord(
          renameKeys(record, {
            email_verified_at: "emailVerified",
            created_at: "createdAt",
            updated_at: "updatedAt",
            registration_provider: "registrationProvider",
            google_id: "googleId",
            facebook_id: "facebookId",
            telegram_id: "telegramId",
            provider_meta: "providerMeta",
            last_login_provider: "lastLoginProvider",
            last_login_at: "lastLoginAt",
            login_count: "loginCount",
          }),
          {
            json: ["providerMeta"],
            numbers: ["loginCount"],
            dates: ["emailVerified", "createdAt", "updatedAt", "lastLoginAt"],
          },
        ),
        ["email", "googleId", "facebookId", "telegramId"],
      ),
  },
  UserSetting: {
    delegate: "userSetting",
    transform: (record) =>
      transformRecord(
        renameKeys(record, {
          user_id: "userId",
          email_notifications: "emailNotifications",
          budget_alerts: "budgetAlerts",
          bill_reminders: "billReminders",
          low_balance_warnings: "lowBalanceWarnings",
          created_at: "createdAt",
          updated_at: "updatedAt",
        }),
        {
          booleans: ["emailNotifications", "budgetAlerts", "billReminders", "lowBalanceWarnings"],
          dates: ["createdAt", "updatedAt"],
        },
      ),
  },
  verification_tokens: {
    delegate: "verificationToken",
    transform: (record) =>
      transformRecord(record, {
        dates: ["expires"],
      }),
  },
  Wallet: {
    delegate: "wallet",
    transform: (record) =>
      transformRecord(
        renameKeys(record, {
          user_id: "userId",
          currency_id: "currencyId",
          is_default: "isDefault",
          created_at: "createdAt",
          updated_at: "updatedAt",
        }),
        {
          booleans: ["isDefault"],
          numbers: ["balance"],
          dates: ["createdAt", "updatedAt"],
        },
      ),
  },
};

function renameKeys(record, mapping) {
  const next = {};

  for (const [key, value] of Object.entries(record)) {
    next[mapping[key] || key] = value;
  }

  return next;
}

function transformRecord(record, config = {}) {
  const next = { ...record };

  for (const key of config.booleans || []) {
    next[key] = next[key] == null ? null : Boolean(next[key]);
  }

  for (const key of config.numbers || []) {
    next[key] = next[key] == null ? null : Number(next[key]);
  }

  for (const key of config.json || []) {
    next[key] = parseJsonValue(next[key]);
  }

  for (const key of config.dates || []) {
    next[key] = parseDateValue(next[key]);
  }

  return next;
}

function unsetNullFields(record, fields) {
  const next = { ...record };

  for (const field of fields) {
    if (next[field] == null) {
      delete next[field];
    }
  }

  return next;
}

function parseJsonValue(value) {
  if (value == null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed === "null") {
    return null;
  }

  return JSON.parse(trimmed);
}

function parseDateValue(value) {
  if (value == null || value === "") {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  const normalized = String(value).replace(" ", "T");
  const isoValue = /Z$/i.test(normalized) ? normalized : `${normalized}Z`;
  return new Date(isoValue);
}

function decodeSqlString(value) {
  return value.replace(/\\(.)/g, (_match, char) => {
    switch (char) {
      case "0":
        return "\0";
      case "b":
        return "\b";
      case "n":
        return "\n";
      case "r":
        return "\r";
      case "t":
        return "\t";
      case "Z":
        return "\u001a";
      default:
        return char;
    }
  });
}

function parseScalar(token) {
  const trimmed = token.trim();

  if (trimmed === "NULL") {
    return null;
  }

  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return decodeSqlString(trimmed.slice(1, -1));
  }

  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  return trimmed;
}

function splitTupleValues(tuple) {
  const values = [];
  let current = "";
  let inString = false;
  let escaped = false;

  for (let index = 0; index < tuple.length; index += 1) {
    const char = tuple[index];

    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === "\\") {
      current += char;
      escaped = true;
      continue;
    }

    if (char === "'") {
      inString = !inString;
      current += char;
      continue;
    }

    if (char === "," && !inString) {
      values.push(parseScalar(current));
      current = "";
      continue;
    }

    current += char;
  }

  if (current) {
    values.push(parseScalar(current));
  }

  return values;
}

function parseRows(block) {
  const rows = [];
  let current = "";
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < block.length; index += 1) {
    const char = block[index];

    if (escaped) {
      if (depth > 0) {
        current += char;
      }
      escaped = false;
      continue;
    }

    if (char === "\\") {
      if (depth > 0) {
        current += char;
      }
      escaped = true;
      continue;
    }

    if (char === "'") {
      inString = !inString;
      if (depth > 0) {
        current += char;
      }
      continue;
    }

    if (!inString && char === "(") {
      if (depth === 0) {
        current = "";
      } else {
        current += char;
      }
      depth += 1;
      continue;
    }

    if (!inString && char === ")") {
      depth -= 1;
      if (depth === 0) {
        rows.push(splitTupleValues(current));
        current = "";
      } else {
        current += char;
      }
      continue;
    }

    if (depth > 0) {
      current += char;
    }
  }

  return rows;
}

function parseDump(sql) {
  const statements = [];
  const insertPattern = /INSERT INTO `([^`]+)` \(([^)]+)\) VALUES\s*([\s\S]*?);/g;
  let match;

  while ((match = insertPattern.exec(sql))) {
    const [, tableName, columnsBlock, valuesBlock] = match;
    const columns = [...columnsBlock.matchAll(/`([^`]+)`/g)].map((item) => item[1]);
    const rows = parseRows(valuesBlock).map((values) => Object.fromEntries(columns.map((column, index) => [column, values[index]])));

    statements.push({
      tableName,
      rows,
    });
  }

  return statements;
}

async function clearDatabase() {
  for (const delegate of CLEAR_ORDER) {
    await prisma[delegate].deleteMany();
  }
}

async function importDump() {
  if (!fs.existsSync(dumpPath)) {
    throw new Error(`SQL dump not found at ${dumpPath}`);
  }

  const sql = fs.readFileSync(dumpPath, "utf8");
  const statements = parseDump(sql);
  let importedRows = 0;

  for (const statement of statements) {
    const config = TABLE_CONFIG[statement.tableName];
    if (!config || !statement.rows.length) {
      continue;
    }

    for (const row of statement.rows) {
      await prisma[config.delegate].create({
        data: config.transform(row),
      });
      importedRows += 1;
    }
  }

  return importedRows;
}

async function main() {
  await prisma.$connect();
  await prisma.$runCommandRaw({ ping: 1 });

  console.log("Clearing MongoDB collections...");
  await clearDatabase();

  console.log(`Importing SQL dump from ${dumpPath}...`);
  const importedRows = await importDump();

  console.log(`Seed complete. Imported ${importedRows} rows from smart_finance.sql.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
