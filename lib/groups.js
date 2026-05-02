import crypto from "crypto";
import { addDays, endOfMonth, startOfMonth } from "date-fns";
import { convertBetweenCurrencies } from "@/lib/currency";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/utils";

export async function getAccessibleGroupIds(userId) {
  const memberships = await prisma.financeGroupMember.findMany({
    where: {
      userId,
      status: "active",
    },
    select: {
      groupId: true,
    },
  });

  return memberships.map((membership) => membership.groupId);
}

export async function requireGroupAccess(userId, groupId) {
  const membership = await prisma.financeGroupMember.findFirst({
    where: {
      userId,
      groupId,
      status: "active",
    },
    include: {
      group: {
        include: {
          owner: true,
          members: {
            where: { status: "active" },
            include: { user: true },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!membership) {
    throw new Error("FORBIDDEN");
  }

  return membership;
}

export function createGroupInviteToken() {
  return crypto.randomBytes(24).toString("hex");
}

export async function buildGroupInviteLink(token) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return `${baseUrl.replace(/\/$/, "")}/dashboard/groups/join/${token}`;
}

export async function getGroupSharedSnapshot(groupId, viewerUserId) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const viewer = viewerUserId
    ? await prisma.user.findUnique({
        where: { id: viewerUserId },
        include: { defaultCurrency: true },
      })
    : null;
  const targetRate = toNumber(viewer?.defaultCurrency?.exchangeRateToUsd, 1);
  const targetCurrencyCode = viewer?.defaultCurrency?.code || "USD";

  const [totalTransactions, monthlyTransactions, recentTransactions, messages] = await Promise.all([
    prisma.transaction.count({ where: { groupId } }),
    prisma.transaction.findMany({
      where: { groupId, transactionDate: { gte: monthStart, lte: monthEnd } },
      include: { currency: true },
    }),
    prisma.transaction.findMany({
      where: { groupId },
      include: {
        user: { select: { id: true, name: true, image: true } },
        wallet: true,
        category: true,
        currency: true,
      },
      orderBy: { transactionDate: "desc" },
      take: 12,
    }),
    prisma.groupMessage.findMany({
      where: { groupId },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const normalizeAmount = (transaction) =>
    convertBetweenCurrencies(
      transaction.originalAmount,
      transaction.exchangeRate || transaction.currency?.exchangeRateToUsd || 1,
      targetRate,
    );

  const spent = monthlyTransactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + normalizeAmount(item), 0);
  const earned = monthlyTransactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + normalizeAmount(item), 0);

  return {
    stats: {
      totalTransactions,
      monthlyIncome: Number(earned.toFixed(2)),
      monthlyExpense: Number(spent.toFixed(2)),
      monthlyNet: Number((earned - spent).toFixed(2)),
    },
    currencyCode: targetCurrencyCode,
    recentTransactions: recentTransactions.map((item) => ({
      ...item,
      displayAmount: Number(normalizeAmount(item).toFixed(2)),
      displayCurrencyCode: targetCurrencyCode,
    })),
    messages: messages.reverse(),
  };
}

export async function createGroupInvite({ groupId, createdById, expiresInDays = 7, maxUses = 25 }) {
  const token = createGroupInviteToken();

  const invite = await prisma.financeGroupInvite.create({
    data: {
      groupId,
      createdById,
      token,
      expiresAt: addDays(new Date(), expiresInDays),
      maxUses,
    },
  });

  return {
    ...invite,
    inviteLink: await buildGroupInviteLink(token),
  };
}
