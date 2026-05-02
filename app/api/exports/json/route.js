import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireUser();
  const payload = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      wallets: true,
      categories: true,
      transactions: true,
      budgets: true,
      savingsGoals: true,
      recurringPayments: true,
      debtLoans: true,
      notifications: true,
      aiInsights: true,
      settings: true,
    },
  });

  await prisma.exportLog.create({ data: { userId: user.id, format: "json", resource: "backup" } });
  return NextResponse.json(payload, {
    headers: {
      "Content-Disposition": 'attachment; filename="finance-backup.json"',
    },
  });
}
