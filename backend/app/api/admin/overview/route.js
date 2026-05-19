import { endOfMonth, startOfMonth } from "date-fns";
import { requireAdmin } from "../../../../lib/auth.js";
import { prisma } from "../../../../lib/prisma.js";
import { toNumber } from "../../../../lib/utils.js";

function parseParams(request) {
  const { searchParams } = new URL(request.url);
  return {
    usersPage: Math.max(1, Number(searchParams.get("usersPage") || 1)),
    transactionsPage: Math.max(1, Number(searchParams.get("transactionsPage") || 1)),
    groupsPage: Math.max(1, Number(searchParams.get("groupsPage") || 1)),
    pageSize: 10,
  };
}

function buildDeviceCounts() {
  return {
    desktop: 0,
    mobile: 0,
    tablet: 0,
    bot: 0,
    unknown: 0,
  };
}

export async function GET(request) {
  try {
    await requireAdmin();
    const params = parseParams(request);

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
      providerCounts,
      recentLogins,
      monthVolumeTransactions,
      monthTransactions,
      recentUsers,
      recentTransactions,
      groups,
      totalAuditLogs,
      authDeviceLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "admin" } }),
      prisma.user.count({ where: { emailVerified: { not: null } } }),
      prisma.transaction.count(),
      prisma.wallet.count(),
      prisma.financeGroup.count(),
      prisma.receipt.count(),
      prisma.notification.count(),
      prisma.user.groupBy({
        by: ["registrationProvider"],
        _count: { _all: true },
      }),
      prisma.user.groupBy({
        by: ["lastLoginProvider"],
        _count: { _all: true },
        where: {
          lastLoginProvider: { not: null },
        },
      }),
      prisma.transaction.findMany({
        select: {
          originalAmount: true,
          exchangeRate: true,
        },
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
          registrationProvider: true,
          lastLoginProvider: true,
          lastLoginAt: true,
          defaultCurrency: { select: { code: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (params.usersPage - 1) * params.pageSize,
        take: params.pageSize,
      }),
      prisma.transaction.findMany({
        include: {
          user: { select: { id: true, name: true, email: true, defaultCurrency: { select: { code: true } } } },
          category: { select: { name: true } },
          currency: { select: { code: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (params.transactionsPage - 1) * params.pageSize,
        take: params.pageSize,
      }),
      prisma.financeGroup.findMany({
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: {
            select: { members: true, transactions: true, messages: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip: (params.groupsPage - 1) * params.pageSize,
        take: params.pageSize,
      }),
      prisma.auditLog.count(),
      prisma.auditLog.findMany({
        where: {
          action: {
            in: ["auth.register", "auth.login"],
          },
        },
        select: {
          action: true,
          meta: true,
        },
      }),
    ]);

    const monthlyVolumeUsd = monthVolumeTransactions.reduce((sum, transaction) => {
      const originalAmount = toNumber(transaction.originalAmount);
      const exchangeRate = Math.max(toNumber(transaction.exchangeRate, 1), 0.000001);
      return sum + originalAmount / exchangeRate;
    }, 0);

    const registrationProviders = {
      email: 0,
      google: 0,
      facebook: 0,
      telegram: 0,
    };
    const lastLoginProviders = {
      email: 0,
      google: 0,
      facebook: 0,
      telegram: 0,
    };
    const signupDeviceCounts = buildDeviceCounts();
    const signinDeviceCounts = buildDeviceCounts();

    for (const row of providerCounts) {
      if (row.registrationProvider in registrationProviders) {
        registrationProviders[row.registrationProvider] = row._count._all;
      }
    }

    for (const row of recentLogins) {
      if (row.lastLoginProvider && row.lastLoginProvider in lastLoginProviders) {
        lastLoginProviders[row.lastLoginProvider] = row._count._all;
      }
    }

    for (const log of authDeviceLogs) {
      const deviceType =
        log?.meta && typeof log.meta === "object" && typeof log.meta.deviceType === "string" && log.meta.deviceType in signupDeviceCounts
          ? log.meta.deviceType
          : "unknown";

      if (log.action === "auth.register") {
        signupDeviceCounts[deviceType] += 1;
      }

      if (log.action === "auth.login") {
        signinDeviceCounts[deviceType] += 1;
      }
    }

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
        totalAuditLogs,
        monthlyVolume: Number(monthlyVolumeUsd.toFixed(2)),
        monthlyTransactions: monthTransactions,
        registrationProviders,
        lastLoginProviders,
        signupDeviceCounts,
        signinDeviceCounts,
      },
      recentUsers,
      recentTransactions,
      recentGroups: groups,
      pagination: {
        users: {
          page: params.usersPage,
          pageSize: params.pageSize,
          total: totalUsers,
          totalPages: Math.ceil(totalUsers / params.pageSize) || 1,
        },
        transactions: {
          page: params.transactionsPage,
          pageSize: params.pageSize,
          total: totalTransactions,
          totalPages: Math.ceil(totalTransactions / params.pageSize) || 1,
        },
        groups: {
          page: params.groupsPage,
          pageSize: params.pageSize,
          total: totalGroups,
          totalPages: Math.ceil(totalGroups / params.pageSize) || 1,
        },
      },
    });
  } catch (error) {
    const status = error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : 500;
    return Response.json({ error: error.message }, { status });
  }
}
