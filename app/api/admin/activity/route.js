import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function buildSearchParams(request) {
  const { searchParams } = new URL(request.url);
  return {
    page: Number(searchParams.get("page") || 1),
    pageSize: Number(searchParams.get("pageSize") || 15),
    search: (searchParams.get("search") || "").trim().toLowerCase(),
    type: (searchParams.get("type") || "").trim().toLowerCase(),
  };
}

function matchesSearch(entry, search) {
  if (!search) return true;
  const haystack = [
    entry.type,
    entry.title,
    entry.description,
    entry.user?.name,
    entry.user?.email,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(search);
}

export async function GET(request) {
  try {
    await requireAdmin();
    const params = buildSearchParams(request);

    const [users, transactions, groups, messages, receipts, notifications] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.transaction.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          category: { select: { name: true } },
          wallet: { select: { name: true } },
          group: { select: { id: true, name: true } },
          currency: { select: { code: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 40,
      }),
      prisma.financeGroup.findMany({
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { members: true, transactions: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.groupMessage.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          group: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.receipt.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          transaction: { select: { id: true, type: true } },
        },
        orderBy: { uploadedAt: "desc" },
        take: 20,
      }),
      prisma.notification.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    const items = [
      ...users.map((user) => ({
        id: `user-${user.id}`,
        type: "user",
        title: "New account registered",
        description: `${user.name || "Unnamed user"} joined with ${user.role} access`,
        timestamp: user.createdAt,
        user: { id: user.id, name: user.name, email: user.email },
        href: `/dashboard/admin/users/${user.id}`,
      })),
      ...transactions.map((transaction) => ({
        id: `transaction-${transaction.id}`,
        type: "transaction",
        title: `${transaction.type} transaction recorded`,
        description: `${transaction.category?.name || "Uncategorized"} via ${transaction.wallet?.name || "wallet"}${transaction.group?.name ? ` in ${transaction.group.name}` : ""}`,
        timestamp: transaction.createdAt,
        user: transaction.user,
        href: `/dashboard/admin/users/${transaction.userId}`,
      })),
      ...groups.map((group) => ({
        id: `group-${group.id}`,
        type: "group",
        title: "Finance group updated",
        description: `${group.name} has ${group._count.members} members and ${group._count.transactions} shared transactions`,
        timestamp: group.createdAt,
        user: group.owner,
        href: "/dashboard/groups",
      })),
      ...messages.map((message) => ({
        id: `message-${message.id}`,
        type: "message",
        title: "Group message posted",
        description: `${message.user?.name || "A member"} wrote in ${message.group?.name || "a group"}`,
        timestamp: message.createdAt,
        user: message.user,
        href: "/dashboard/groups",
      })),
      ...receipts.map((receipt) => ({
        id: `receipt-${receipt.id}`,
        type: "receipt",
        title: "Receipt uploaded",
        description: `${receipt.originalName} attached${receipt.transaction ? ` to a ${receipt.transaction.type} transaction` : ""}`,
        timestamp: receipt.uploadedAt,
        user: receipt.user,
        href: "/dashboard/receipts",
      })),
      ...notifications.map((notification) => ({
        id: `notification-${notification.id}`,
        type: "notification",
        title: "Notification created",
        description: `${notification.title} (${notification.type})`,
        timestamp: notification.createdAt,
        user: notification.user,
        href: notification.actionUrl || "/dashboard/notifications",
      })),
    ]
      .filter((entry) => (!params.type ? true : entry.type === params.type))
      .filter((entry) => matchesSearch(entry, params.search))
      .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime());

    const start = (params.page - 1) * params.pageSize;
    const paged = items.slice(start, start + params.pageSize);

    return NextResponse.json({
      items: paged,
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        total: items.length,
        totalPages: Math.ceil(items.length / params.pageSize) || 1,
      },
    });
  } catch (error) {
    const status = error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
