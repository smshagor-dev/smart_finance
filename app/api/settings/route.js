import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { settingsSchema } from "@/lib/validators";
import { publishLiveEvent } from "@/lib/live-events";

export async function GET() {
  const user = await requireUser();
  const currencies = await prisma.currency.findMany({
    where: { isActive: true },
    orderBy: { code: "asc" },
  });

  return NextResponse.json({
    defaultCurrencyId: user.defaultCurrencyId || "",
    language: user.settings?.language || "en",
    theme: user.settings?.theme || "light",
    timezone: user.settings?.timezone || "UTC",
    emailNotifications: user.settings?.emailNotifications ?? true,
    budgetAlerts: user.settings?.budgetAlerts ?? true,
    billReminders: user.settings?.billReminders ?? true,
    lowBalanceWarnings: user.settings?.lowBalanceWarnings ?? true,
    currencies: currencies.map((currency) => ({
      value: currency.id,
      label: `${currency.code} - ${currency.name || currency.code}`,
    })),
  });
}

export async function PUT(request) {
  try {
    const user = await requireUser();
    const payload = settingsSchema.parse(await request.json());

    await prisma.user.update({
      where: { id: user.id },
      data: {
        defaultCurrencyId: payload.defaultCurrencyId,
      },
    });

    await prisma.userSetting.upsert({
      where: { userId: user.id },
      update: {
        language: payload.language,
        theme: payload.theme,
        timezone: payload.timezone,
        emailNotifications: payload.emailNotifications,
        budgetAlerts: payload.budgetAlerts,
        billReminders: payload.billReminders,
        lowBalanceWarnings: payload.lowBalanceWarnings,
      },
      create: {
        userId: user.id,
        language: payload.language,
        theme: payload.theme,
        timezone: payload.timezone,
        emailNotifications: payload.emailNotifications,
        budgetAlerts: payload.budgetAlerts,
        billReminders: payload.billReminders,
        lowBalanceWarnings: payload.lowBalanceWarnings,
      },
    });

    publishLiveEvent({ userId: user.id, resource: "settings", action: "updated" });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: error.name === "ZodError" ? 400 : 500 });
  }
}
