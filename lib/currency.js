import axios from "axios";

const CURRENCY_META = {
  USD: { name: "US Dollar", symbol: "$" },
  BDT: { name: "Bangladeshi Taka", symbol: "Tk" },
  EUR: { name: "Euro", symbol: "EUR" },
  RUB: { name: "Russian Ruble", symbol: "RUB" },
};

export function getCurrencyMeta(code) {
  return CURRENCY_META[code] || { name: code, symbol: code };
}

export function convertBetweenCurrencies(amount, fromRateToUsd = 1, toRateToUsd = 1) {
  const safeFrom = Number(fromRateToUsd) || 1;
  const safeTo = Number(toRateToUsd) || 1;
  const usdAmount = Number(amount) / safeFrom;
  return usdAmount * safeTo;
}

export async function syncCurrencies(prisma) {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  const baseUrl = process.env.EXCHANGE_RATE_BASE_URL;

  if (!apiKey || !baseUrl) {
    throw new Error("Currency sync is not configured");
  }

  const response = await axios.get(`${baseUrl}/${apiKey}/latest/USD`, {
    timeout: 15000,
  });

  const rates = response.data?.conversion_rates;
  if (!rates || typeof rates !== "object") {
    throw new Error("Exchange API response did not include conversion rates");
  }

  const syncedAt = new Date();
  let count = 0;

  for (const [code, rate] of Object.entries(rates)) {
    const meta = getCurrencyMeta(code);
    await prisma.currency.upsert({
      where: { code },
      update: {
        name: meta.name,
        symbol: meta.symbol,
        exchangeRateToUsd: Number(rate),
        isActive: true,
        lastSyncedAt: syncedAt,
      },
      create: {
        code,
        name: meta.name,
        symbol: meta.symbol,
        exchangeRateToUsd: Number(rate),
        isActive: true,
        lastSyncedAt: syncedAt,
      },
    });
    count += 1;
  }

  return {
    count,
    baseCode: response.data?.base_code || "USD",
    syncedAt,
  };
}
