import { endOfMonth, startOfMonth } from "date-fns";
import { requireAdmin } from "../../../../lib/auth.js";
import { prisma } from "../../../../lib/prisma.js";
import { toNumber } from "../../../../lib/utils.js";

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const [
      totalUsers,
      totalAdmins,
      verifiedUsers,
      totalTransactions,
      totalWallets,
      totalGroups,
      totalReceipts,
      totalNotifications,
      monthVolume,
      monthTransactions,
      recentUsers,
      recentTransactions,
      groups,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "admin" } }),
      prisma.user.count({ where: { emailVerified: { not: null } } }),
      prisma.transaction.count(),
      prisma.wallet.count(),
      prisma.financeGroup.count(),
      prisma.receipt.count(),
      prisma.notification.count(),
      prisma.transaction.aggregate({
        _sum: { convertedAmount: true },
        where: { transactionDate: { gte: monthStart, lte: monthEnd } },
      }),
      prisma.transaction.count({
        where: { transactionDate: { gte: monthStart, lte: monthEnd } },
      }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          image: true,
          defaultCurrency: { select: { code: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.transaction.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          category: { select: { name: true } },
          currency: { select: { code: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.financeGroup.findMany({
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: {
            select: { members: true, transactions: true, messages: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 6,
      }),
    ]);

    return Response.json({
      stats: {
        totalUsers,
        totalAdmins,
        verifiedUsers,
        totalTransactions,
        totalWallets,
        totalGroups,
        totalReceipts,
        totalNotifications,
        monthlyVolume: toNumber(monthVolume._sum.convertedAmount),
        monthlyTransactions: monthTransactions,
      },
      recentUsers,
      recentTransactions,
      recentGroups: groups,
    });
  } catch (error) {
    const status = error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : 500;
    return Response.json({ error: error.message }, { status });
  }
}
