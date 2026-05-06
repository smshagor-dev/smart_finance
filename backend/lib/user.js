import { prisma } from "./prisma.js";

export async function ensureUserFinanceSetup(userId, defaultCurrencyId) {
  const usdCurrency =
    (defaultCurrencyId && (await prisma.currency.findUnique({ where: { id: defaultCurrencyId } }))) ||
    (await prisma.currency.findUnique({ where: { code: "USD" } }));

  await prisma.user.update({
    where: { id: userId },
    data: {
      defaultCurrencyId: defaultCurrencyId || usdCurrency?.id || null,
    },
  });

  await prisma.userSetting.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      language: "en",
      theme: "light",
      timezone: "UTC",
    },
  });
}
