const { PrismaClient } = require("@prisma/client");
const axios = require("axios");

const prisma = new PrismaClient();

const CURRENCY_META = {
  USD: { name: "US Dollar", symbol: "$" },
  BDT: { name: "Bangladeshi Taka", symbol: "Tk" },
  EUR: { name: "Euro", symbol: "EUR" },
  RUB: { name: "Russian Ruble", symbol: "RUB" },
};

function isValidEmail(value) {
  if (!value) {
    return false;
  }

  return /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/.test(String(value));
}

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
  await prisma.$executeRaw`
    INSERT INTO site_settings (
      id,
      site_name,
      site_tagline,
      site_description,
      seo_title,
      seo_description,
      seo_keywords,
      support_email,
      site_url,
      smtp_host,
      smtp_port,
      smtp_secure,
      smtp_user,
      smtp_pass,
      smtp_from,
      require_email_verification,
      verification_code_expiry_minutes
    ) VALUES (
      ${"global"},
      ${"Finance Tracker"},
      ${"Personal finance command center"},
      ${"Personal finance tracker built with Next.js, Prisma, and MySQL"},
      ${"Finance Tracker"},
      ${"Personal finance tracker built with Next.js, Prisma, and MySQL"},
      ${"finance tracker, budgeting, expenses, income, wallet, reports"},
      ${isValidEmail(process.env.SMTP_USER) ? process.env.SMTP_USER : null},
      ${process.env.NEXTAUTH_URL || "http://localhost:3001"},
      ${process.env.SMTP_HOST || null},
      ${Number(process.env.SMTP_PORT || 587)},
      ${process.env.SMTP_SECURE === "true"},
      ${process.env.SMTP_USER || null},
      ${process.env.SMTP_PASS || null},
      ${process.env.SMTP_FROM || null},
      ${true},
      ${15}
    )
    ON DUPLICATE KEY UPDATE
      site_name = VALUES(site_name),
      site_tagline = VALUES(site_tagline),
      site_description = VALUES(site_description),
      seo_title = VALUES(seo_title),
      seo_description = VALUES(seo_description),
      seo_keywords = VALUES(seo_keywords),
      support_email = VALUES(support_email),
      site_url = VALUES(site_url),
      smtp_host = VALUES(smtp_host),
      smtp_port = VALUES(smtp_port),
      smtp_secure = VALUES(smtp_secure),
      smtp_user = VALUES(smtp_user),
      smtp_pass = VALUES(smtp_pass),
      smtp_from = VALUES(smtp_from),
      require_email_verification = VALUES(require_email_verification),
      verification_code_expiry_minutes = VALUES(verification_code_expiry_minutes),
      updated_at = NOW()
  `;

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
