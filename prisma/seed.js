const { PrismaClient } = require("@prisma/client");
const axios = require("axios");

const prisma = new PrismaClient();

const CURRENCY_META = {
  USD: { name: "US Dollar", symbol: "$" },
  BDT: { name: "Bangladeshi Taka", symbol: "Tk" },
  EUR: { name: "Euro", symbol: "EUR" },
  RUB: { name: "Russian Ruble", symbol: "RUB" },
};

async function syncCurrenciesFromApi() {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  const baseUrl = process.env.EXCHANGE_RATE_BASE_URL;
  if (!apiKey || !baseUrl) {
    throw new Error("Currency sync is not configured");
  }

  const response = await axios.get(`${baseUrl}/${apiKey}/latest/USD`, {
    timeout: 15000,
  });

  const rates = response.data?.conversion_rates;
  if (!rates) {
    throw new Error("Exchange API response did not include conversion rates");
  }

  for (const [code, rate] of Object.entries(rates)) {
    const meta = CURRENCY_META[code] || { name: code, symbol: code };
    await prisma.currency.upsert({
      where: { code },
      update: {
        name: meta.name,
        symbol: meta.symbol,
        exchangeRateToUsd: Number(rate),
        isActive: true,
        lastSyncedAt: new Date(),
      },
      create: {
        code,
        name: meta.name,
        symbol: meta.symbol,
        exchangeRateToUsd: Number(rate),
        isActive: true,
        lastSyncedAt: new Date(),
      },
    });
  }
}

async function ensureBaseCurrencies() {
  const defaults = [
    { code: "USD", name: "US Dollar", symbol: "$", exchangeRateToUsd: 1 },
    { code: "BDT", name: "Bangladeshi Taka", symbol: "Tk", exchangeRateToUsd: 117.25 },
    { code: "EUR", name: "Euro", symbol: "EUR", exchangeRateToUsd: 0.92 },
    { code: "RUB", name: "Russian Ruble", symbol: "RUB", exchangeRateToUsd: 92.4 },
  ];

  for (const currency of defaults) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: {
        ...currency,
        isActive: true,
        lastSyncedAt: new Date(),
      },
      create: {
        ...currency,
        isActive: true,
        lastSyncedAt: new Date(),
      },
    });
  }
}

async function main() {
  await ensureBaseCurrencies();
  await prisma.siteSetting.upsert({
    where: { id: "global" },
    update: {},
    create: {
      id: "global",
      siteName: "Finance Tracker",
      siteTagline: "Personal finance command center",
      siteDescription: "Personal finance tracker built with Next.js, Prisma, and MySQL",
      seoTitle: "Finance Tracker",
      seoDescription: "Personal finance tracker built with Next.js, Prisma, and MySQL",
      seoKeywords: "finance tracker, budgeting, expenses, income, wallet, reports",
      supportEmail: process.env.SMTP_FROM || process.env.SMTP_USER || null,
      siteUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
      smtpHost: process.env.SMTP_HOST || null,
      smtpPort: Number(process.env.SMTP_PORT || 587),
      smtpSecure: process.env.SMTP_SECURE === "true",
      smtpUser: process.env.SMTP_USER || null,
      smtpPass: process.env.SMTP_PASS || null,
      smtpFrom: process.env.SMTP_FROM || null,
      requireEmailVerification: true,
      verificationCodeExpiryMinutes: 15,
    },
  });

  try {
    await syncCurrenciesFromApi();
    console.log("Currency sync finished.");
  } catch (error) {
    console.warn(`Currency sync skipped: ${error.message}`);
  }

  console.log("Seed complete");
  console.log("Database starts without demo users or sample finance records.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
