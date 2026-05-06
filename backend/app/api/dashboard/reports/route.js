import { startOfWeek, subDays, subMonths, subYears } from "date-fns";
import { requireUser } from "../../../../lib/auth.js";
import { prisma } from "../../../../lib/prisma.js";
import { toNumber } from "../../../../lib/utils.js";

async function sumTransactions(userId, type, from) {
  const result = await prisma.transaction.aggregate({
    _sum: { convertedAmount: true },
    where: {
      userId,
      type,
      transactionDate: { gte: from, lte: new Date() },
    },
  });
  return toNumber(result._sum.convertedAmount);
}

export async function GET() {
  try {
    const user = await requireUser();
    const now = new Date();
    const [daily, weekly, monthly, yearly, categorySpendingRaw, monthlyTrendRaw] = await Promise.all([
      Promise.all([sumTransactions(user.id, "income", subDays(now, 1)), sumTransactions(user.id, "expense", subDays(now, 1))]),
      Promise.all([sumTransactions(user.id, "income", startOfWeek(now, { weekStartsOn: 1 })), sumTransactions(user.id, "expense", startOfWeek(now, { weekStartsOn: 1 }))]),
      Promise.all([sumTransactions(user.id, "income", subMonths(now, 1)), sumTransactions(user.id, "expense", subMonths(now, 1))]),
      Promise.all([sumTransactions(user.id, "income", subYears(now, 1)), sumTransactions(user.id, "expense", subYears(now, 1))]),
      prisma.transaction.groupBy({
        by: ["categoryId"],
        _sum: { convertedAmount: true },
        where: { userId: user.id, type: "expense" },
      }),
      prisma.transaction.findMany({
        where: { userId: user.id },
        orderBy: { transactionDate: "asc" },
        select: { type: true, convertedAmount: true, transactionDate: true },
      }),
    ]);

    const categories = await prisma.category.findMany({ where: { OR: [{ userId: user.id }, { isDefault: true }] } });
    const monthlyMap = new Map();
    monthlyTrendRaw.forEach((item) => {
      const key = `${item.transactionDate.getFullYear()}-${item.transactionDate.getMonth() + 1}`;
      const current = monthlyMap.get(key) || { month: key, income: 0, expense: 0 };
      current[item.type] += toNumber(item.convertedAmount);
      monthlyMap.set(key, current);
    });

    return Response.json({
      currencyCode: user.defaultCurrency?.code || "USD",
      summary: [
        { label: "Daily Net", value: daily[0] - daily[1] },
        { label: "Weekly Net", value: weekly[0] - weekly[1] },
        { label: "Monthly Net", value: monthly[0] - monthly[1] },
        { label: "Yearly Net", value: yearly[0] - yearly[1] },
      ],
      categorySpending: categorySpendingRaw.map((item) => ({
        name: categories.find((category) => category.id === item.categoryId)?.name || "Uncategorized",
        value: toNumber(item._sum.convertedAmount),
      })),
      monthlyTrend: Array.from(monthlyMap.values()).slice(-6),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: error.message === "UNAUTHORIZED" ? 401 : 500 });
  }
}
