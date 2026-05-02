import { addDays, addMonths, addWeeks, addYears, endOfMonth, startOfMonth, subMonths } from "date-fns";
import { prisma } from "@/lib/prisma";
import { convertBetweenCurrencies } from "@/lib/currency";
import { toNumber } from "@/lib/utils";

function transactionEffect(type, amount) {
  if (type === "expense") return -toNumber(amount);
  if (type === "income") return toNumber(amount);
  return 0;
}

function nextRecurringDate(date, frequency) {
  const current = new Date(date);
  if (frequency === "daily") return addDays(current, 1);
  if (frequency === "weekly") return addWeeks(current, 1);
  if (frequency === "monthly") return addMonths(current, 1);
  return addYears(current, 1);
}

export async function adjustWalletBalance(tx, walletId, delta) {
  if (!walletId || !delta) return;
  await tx.wallet.update({
    where: { id: walletId },
    data: {
      balance: {
        increment: delta,
      },
    },
  });
}

async function resolveTransactionAmounts(tx, userId, data, existing) {
  const user = await tx.user.findUnique({
    where: { id: userId },
    include: { defaultCurrency: true },
  });

  const wallet = await tx.wallet.findFirst({
    where: {
      id: data.walletId || existing?.walletId,
      userId,
    },
    include: { currency: true },
  });

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  const transactionCurrency =
    (data.currencyId || existing?.currencyId)
      ? await tx.currency.findUnique({ where: { id: data.currencyId || existing?.currencyId } })
      : wallet.currency || user.defaultCurrency || (await tx.currency.findUnique({ where: { code: "USD" } }));

  const defaultCurrency = user.defaultCurrency || (await tx.currency.findUnique({ where: { code: "USD" } }));
  const originalAmount = toNumber(data.originalAmount ?? data.amount ?? existing?.originalAmount ?? 0);
  const exchangeRate = toNumber(data.exchangeRate ?? transactionCurrency?.exchangeRateToUsd ?? existing?.exchangeRate ?? 1, 1);
  const walletRate = toNumber(wallet.currency?.exchangeRateToUsd ?? transactionCurrency?.exchangeRateToUsd ?? 1, 1);
  const defaultRate = toNumber(defaultCurrency?.exchangeRateToUsd ?? 1, 1);

  const walletAmount = convertBetweenCurrencies(originalAmount, exchangeRate, walletRate);
  const convertedAmount = convertBetweenCurrencies(originalAmount, exchangeRate, defaultRate);

  return {
    amount: Number(walletAmount.toFixed(2)),
    originalAmount: Number(originalAmount.toFixed(2)),
    convertedAmount: Number(convertedAmount.toFixed(2)),
    exchangeRate: Number(exchangeRate.toFixed(6)),
    currencyId: transactionCurrency?.id || wallet.currencyId || defaultCurrency?.id || null,
    walletId: wallet.id,
  };
}

export async function createTransactionWithBalance(userId, data) {
  return prisma.$transaction(async (tx) => {
    if (data.groupId) {
      const membership = await tx.financeGroupMember.findFirst({
        where: {
          userId,
          groupId: data.groupId,
          status: "active",
        },
      });

      if (!membership) {
        throw new Error("FORBIDDEN");
      }
    }

    const amounts = await resolveTransactionAmounts(tx, userId, data);
    const transaction = await tx.transaction.create({
      data: {
        ...data,
        ...amounts,
        userId,
      },
      include: {
        wallet: { include: { currency: true } },
        category: true,
        currency: true,
      },
    });

    await adjustWalletBalance(tx, transaction.walletId, transactionEffect(transaction.type, transaction.amount));
    return transaction;
  });
}

export async function updateTransactionWithBalance(userId, id, data) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.transaction.findFirst({
      where: {
        id,
        OR: [
          { userId },
          {
            group: {
              members: {
                some: {
                  userId,
                  status: "active",
                },
              },
            },
          },
        ],
      },
    });

    if (!existing) {
      throw new Error("NOT_FOUND");
    }

    const targetGroupId = data.groupId ?? existing.groupId;
    if (targetGroupId) {
      const membership = await tx.financeGroupMember.findFirst({
        where: {
          userId,
          groupId: targetGroupId,
          status: "active",
        },
      });

      if (!membership) {
        throw new Error("FORBIDDEN");
      }
    }

    await adjustWalletBalance(tx, existing.walletId, -transactionEffect(existing.type, existing.amount));
    const amounts = await resolveTransactionAmounts(tx, userId, data, existing);

    const updated = await tx.transaction.update({
      where: { id },
      data: {
        ...data,
        ...amounts,
      },
      include: {
        wallet: { include: { currency: true } },
        category: true,
        currency: true,
      },
    });

    await adjustWalletBalance(tx, updated.walletId, transactionEffect(updated.type, updated.amount));
    return updated;
  });
}

export async function deleteTransactionWithBalance(userId, id) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.transaction.findFirst({
      where: {
        id,
        OR: [
          { userId },
          {
            group: {
              members: {
                some: {
                  userId,
                  status: "active",
                },
              },
            },
          },
        ],
      },
    });

    if (!existing) {
      throw new Error("NOT_FOUND");
    }

    await tx.transaction.delete({ where: { id } });
    await adjustWalletBalance(tx, existing.walletId, -transactionEffect(existing.type, existing.amount));
    return existing;
  });
}

export async function createSavingsContribution(userId, data) {
  return prisma.$transaction(async (tx) => {
    const contribution = await tx.savingsContribution.create({
      data: { ...data, userId },
    });

    const goal = await tx.savingsGoal.update({
      where: { id: data.savingsGoalId },
      data: {
        currentAmount: { increment: data.amount },
      },
    });

    if (toNumber(goal.currentAmount) >= toNumber(goal.targetAmount)) {
      await tx.savingsGoal.update({
        where: { id: goal.id },
        data: { status: "completed" },
      });
    }

    return contribution;
  });
}

export async function deleteSavingsContribution(userId, id) {
  return prisma.$transaction(async (tx) => {
    const contribution = await tx.savingsContribution.findFirst({
      where: { id, userId },
    });
    if (!contribution) throw new Error("NOT_FOUND");

    await tx.savingsGoal.update({
      where: { id: contribution.savingsGoalId },
      data: {
        currentAmount: { decrement: contribution.amount },
        status: "active",
      },
    });

    await tx.savingsContribution.delete({ where: { id } });
    return contribution;
  });
}

export async function createDebtPayment(userId, data) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.debtPayment.create({
      data: { ...data, userId },
    });

    const debt = await tx.debtLoan.update({
      where: { id: data.debtLoanId },
      data: {
        paidAmount: { increment: data.amount },
      },
    });

    const nextPaid = toNumber(debt.paidAmount);
    const status = nextPaid >= toNumber(debt.amount) ? "paid" : nextPaid > 0 ? "partial" : "unpaid";

    await tx.debtLoan.update({
      where: { id: data.debtLoanId },
      data: { status },
    });

    return payment;
  });
}

export async function deleteDebtPayment(userId, id) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.debtPayment.findFirst({
      where: { id, userId },
    });
    if (!payment) throw new Error("NOT_FOUND");

    const debt = await tx.debtLoan.findUnique({ where: { id: payment.debtLoanId } });
    const nextPaid = Math.max(toNumber(debt.paidAmount) - toNumber(payment.amount), 0);
    const status = nextPaid >= toNumber(debt.amount) ? "paid" : nextPaid > 0 ? "partial" : "unpaid";

    await tx.debtLoan.update({
      where: { id: payment.debtLoanId },
      data: {
        paidAmount: { decrement: payment.amount },
        status,
      },
    });

    await tx.debtPayment.delete({ where: { id } });
    return payment;
  });
}

export async function generateRuleBasedInsights(userId) {
  const now = new Date();
  const currentStart = startOfMonth(now);
  const currentEnd = endOfMonth(now);
  const previousStart = startOfMonth(subMonths(now, 1));
  const previousEnd = endOfMonth(subMonths(now, 1));

  const [currentExpenses, previousExpenses, budgets, currentIncome, previousIncome, goals] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, type: "expense", transactionDate: { gte: currentStart, lte: currentEnd } },
      include: { category: true },
    }),
    prisma.transaction.findMany({
      where: { userId, type: "expense", transactionDate: { gte: previousStart, lte: previousEnd } },
      include: { category: true },
    }),
    prisma.budget.findMany({
      where: { userId, month: now.getMonth() + 1, year: now.getFullYear() },
      include: { category: true },
    }),
    prisma.transaction.aggregate({
      _sum: { convertedAmount: true },
      where: { userId, type: "income", transactionDate: { gte: currentStart, lte: currentEnd } },
    }),
    prisma.transaction.aggregate({
      _sum: { convertedAmount: true },
      where: { userId, type: "income", transactionDate: { gte: previousStart, lte: previousEnd } },
    }),
    prisma.savingsGoal.findMany({ where: { userId, status: "active" } }),
  ]);

  const insights = [];
  const expenseByCategory = new Map();
  currentExpenses.forEach((item) => {
    const name = item.category?.name || "Uncategorized";
    expenseByCategory.set(name, (expenseByCategory.get(name) || 0) + toNumber(item.convertedAmount));
  });

  previousExpenses.forEach((item) => {
    const name = item.category?.name || "Uncategorized";
    const previous = expenseByCategory.get(`${name}__previous`) || 0;
    expenseByCategory.set(`${name}__previous`, previous + toNumber(item.convertedAmount));
  });

  for (const [name, value] of expenseByCategory.entries()) {
    if (name.endsWith("__previous")) continue;
    const previous = expenseByCategory.get(`${name}__previous`) || 0;
    if (previous > 0 && value > previous) {
      const change = Math.round(((value - previous) / previous) * 100);
      if (change >= 20) {
        insights.push({
          insightType: "spending",
          title: `${name} expense increased`,
          description: `Your ${name.toLowerCase()} expense increased by ${change}% this month.`,
          severity: change >= 40 ? "danger" : "warning",
        });
      }
    }
  }

  budgets.forEach((budget) => {
    const spent = currentExpenses
      .filter((expense) => !budget.categoryId || expense.categoryId === budget.categoryId)
      .reduce((sum, item) => sum + toNumber(item.convertedAmount), 0);
    const ratio = spent / Math.max(toNumber(budget.amount), 1);

    if (ratio >= 1) {
      insights.push({
        insightType: "budget",
        title: `${budget.category?.name || "Overall"} budget exceeded`,
        description: `You spent more than 100% of your ${budget.category?.name?.toLowerCase() || "overall"} budget.`,
        severity: "danger",
      });
    } else if (ratio >= 0.8) {
      insights.push({
        insightType: "budget",
        title: `${budget.category?.name || "Overall"} budget warning`,
        description: `You spent more than 80% of your ${budget.category?.name?.toLowerCase() || "overall"} budget.`,
        severity: "warning",
      });
    }
  });

  const incomeCurrent = toNumber(currentIncome._sum.convertedAmount);
  const incomePrevious = toNumber(previousIncome._sum.convertedAmount);
  if (incomePrevious > 0 && incomeCurrent > incomePrevious) {
    const change = Math.round(((incomeCurrent - incomePrevious) / incomePrevious) * 100);
    insights.push({
      insightType: "saving",
      title: "Income momentum improved",
      description: `You earned ${change}% more compared to last month.`,
      severity: "success",
    });
  }

  goals.forEach((goal) => {
    const ratio = toNumber(goal.currentAmount) / Math.max(toNumber(goal.targetAmount), 1);
    if (ratio >= 1) {
      insights.push({
        insightType: "savings",
        title: `${goal.title} completed`,
        description: `You reached your savings goal for ${goal.title}.`,
        severity: "success",
      });
    }
  });

  return insights.slice(0, 6);
}

export async function syncRecurringTransactions(userId) {
  const dueItems = await prisma.recurringPayment.findMany({
    where: {
      userId,
      autoCreate: true,
      status: "active",
      nextDueDate: { lte: new Date() },
    },
  });

  for (const item of dueItems) {
    await createTransactionWithBalance(userId, {
      type: item.type,
      amount: item.amount,
      categoryId: item.categoryId,
      walletId: item.walletId,
      note: `Auto-created from recurring item: ${item.title}`,
      transactionDate: item.nextDueDate,
      paymentMethod: "auto",
      incomeSource: item.type === "income" ? item.title : null,
    });

    await prisma.recurringPayment.update({
      where: { id: item.id },
      data: {
        nextDueDate: nextRecurringDate(item.nextDueDate, item.frequency),
      },
    });
  }
}
