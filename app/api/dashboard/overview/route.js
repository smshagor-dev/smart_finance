import { eachMonthOfInterval, endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { convertBetweenCurrencies } from "@/lib/currency";
import { generateRuleBasedInsights, syncRecurringTransactions } from "@/lib/finance";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/utils";

export async function GET(request) {
  try {
    const user = await requireUser();
    await syncRecurringTransactions(user.id);

    const mode = new URL(request.url).searchParams.get("mode");
    const [wallets, categories, currencies] = await Promise.all([
      prisma.wallet.findMany({ where: { userId: user.id }, include: { currency: true }, orderBy: { createdAt: "desc" } }),
      prisma.category.findMany({ where: { OR: [{ userId: user.id }, { isDefault: true }] }, orderBy: { name: "asc" } }),
      prisma.currency.findMany({ where: { isActive: true }, orderBy: { code: "asc" } }),
    ]);
    const groups = await prisma.financeGroupMember.findMany({
      where: { userId: user.id, status: "active" },
      include: { group: true },
      orderBy: { createdAt: "asc" },
    });

    if (mode === "lookups") {
      return NextResponse.json({
        lookups: {
          wallets: wallets.map((wallet) => ({ id: wallet.id, name: wallet.name })),
          categories: categories.map((category) => ({ id: category.id, name: `${category.name} (${category.type})` })),
          incomeCategories: categories.filter((category) => category.type === "income").map((category) => ({ id: category.id, name: category.name })),
          expenseCategories: categories.filter((category) => category.type === "expense").map((category) => ({ id: category.id, name: category.name })),
          currencies: currencies.map((currency) => ({ id: currency.id, name: `${currency.code} - ${currency.name || currency.code}` })),
          groups: groups.map((membership) => ({ id: membership.group.id, name: membership.group.name })),
        },
      });
    }

    const defaultCurrency = user.defaultCurrency || currencies.find((currency) => currency.code === "USD");
    const defaultRate = toNumber(defaultCurrency?.exchangeRateToUsd, 1);
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const sixMonths = eachMonthOfInterval({
      start: startOfMonth(subMonths(now, 5)),
      end: currentMonthStart,
    });

    const [income, expense, recentTransactions, recurring, budgets, goals, notifications, insights] = await Promise.all([
      prisma.transaction.aggregate({
        _sum: { convertedAmount: true },
        where: { userId: user.id, type: "income", transactionDate: { gte: currentMonthStart, lte: currentMonthEnd } },
      }),
      prisma.transaction.aggregate({
        _sum: { convertedAmount: true },
        where: { userId: user.id, type: "expense", transactionDate: { gte: currentMonthStart, lte: currentMonthEnd } },
      }),
      prisma.transaction.findMany({
        where: { userId: user.id },
        include: { category: true, wallet: true, currency: true },
        orderBy: { transactionDate: "desc" },
        take: 5,
      }),
      prisma.recurringPayment.findMany({
        where: { userId: user.id, status: "active" },
        include: { wallet: { include: { currency: true } } },
        orderBy: { nextDueDate: "asc" },
        take: 5,
      }),
      prisma.budget.findMany({
        where: { userId: user.id, month: now.getMonth() + 1, year: now.getFullYear() },
        include: { category: true },
      }),
      prisma.savingsGoal.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5 }),
      generateRuleBasedInsights(user.id),
    ]);

    const totalBalance = wallets.reduce(
      (sum, wallet) => sum + convertBetweenCurrencies(wallet.balance, wallet.currency?.exchangeRateToUsd || 1, defaultRate),
      0,
    );
    const totalIncome = toNumber(income._sum.convertedAmount);
    const totalExpense = toNumber(expense._sum.convertedAmount);

    const monthlyTrend = await Promise.all(
      sixMonths.map(async (monthStart) => {
        const monthEnd = endOfMonth(monthStart);
        const [incomeSum, expenseSum] = await Promise.all([
          prisma.transaction.aggregate({
            _sum: { convertedAmount: true },
            where: { userId: user.id, type: "income", transactionDate: { gte: monthStart, lte: monthEnd } },
          }),
          prisma.transaction.aggregate({
            _sum: { convertedAmount: true },
            where: { userId: user.id, type: "expense", transactionDate: { gte: monthStart, lte: monthEnd } },
          }),
        ]);

        return {
          month: format(monthStart, "MMM"),
          income: toNumber(incomeSum._sum.convertedAmount),
          expense: toNumber(expenseSum._sum.convertedAmount),
        };
      }),
    );

    const expenseByCategoryRaw = await prisma.transaction.groupBy({
      by: ["categoryId"],
      _sum: { convertedAmount: true },
      where: { userId: user.id, type: "expense", transactionDate: { gte: currentMonthStart, lte: currentMonthEnd } },
    });

    const expenseByCategory = expenseByCategoryRaw.map((group) => ({
      name: categories.find((category) => category.id === group.categoryId)?.name || "Uncategorized",
      value: toNumber(group._sum.convertedAmount),
    }));

    const budgetsWithUsage = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await prisma.transaction.aggregate({
          _sum: { convertedAmount: true },
          where: {
            userId: user.id,
            type: "expense",
            transactionDate: { gte: budget.startDate, lte: budget.endDate },
            ...(budget.categoryId ? { categoryId: budget.categoryId } : {}),
            ...(budget.walletId ? { walletId: budget.walletId } : {}),
          },
        });

        return {
          ...budget,
          progress: toNumber(spent._sum.convertedAmount) / Math.max(toNumber(budget.amount), 1),
        };
      }),
    );

    return NextResponse.json({
      stats: {
        totalBalance,
        totalIncome,
        totalExpense,
        monthlySavings: totalIncome - totalExpense,
        currencyCode: defaultCurrency?.code || "USD",
        currencySymbol: defaultCurrency?.symbol || "$",
        expenseByCategory,
        monthlyTrend,
      },
      recentTransactions,
      walletSummary: wallets.map((wallet) => ({
        ...wallet,
        displayBalance: convertBetweenCurrencies(wallet.balance, wallet.currency?.exchangeRateToUsd || 1, defaultRate),
      })),
      upcomingBills: recurring.map((bill) => ({
        ...bill,
        displayAmount: convertBetweenCurrencies(bill.amount, bill.wallet?.currency?.exchangeRateToUsd || 1, defaultRate),
      })),
      budgets: budgetsWithUsage,
      goals,
      notifications,
      insights,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: error.message === "UNAUTHORIZED" ? 401 : 500 });
  }
}
