import { ensureAdminMutationAllowed } from "../../../../../lib/admin.js";
import { requireAdmin } from "../../../../../lib/auth.js";
import { publishGlobalLiveEvent } from "../../../../../lib/live-events.js";
import { prisma } from "../../../../../lib/prisma.js";
import { adminUserUpdateSchema } from "../../../../../lib/validators/index.js";

function errorStatus(message) {
  if (message === "UNAUTHORIZED") return 401;
  if (message === "FORBIDDEN") return 403;
  if (message === "NOT_FOUND") return 404;
  if (message === "LAST_ADMIN" || message === "SELF_DELETE") return 400;
  return 500;
}

export async function GET(_request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        defaultCurrency: { select: { id: true, code: true, symbol: true, name: true } },
        settings: true,
        wallets: {
          include: { currency: { select: { code: true, symbol: true } } },
          orderBy: { createdAt: "desc" },
          take: 6,
        },
        transactions: {
          include: {
            category: { select: { name: true } },
            wallet: { select: { name: true } },
            currency: { select: { code: true } },
            group: { select: { id: true, name: true } },
          },
          orderBy: { transactionDate: "desc" },
          take: 8,
        },
        budgets: {
          include: { category: { select: { name: true } } },
          orderBy: [{ year: "desc" }, { month: "desc" }],
          take: 5,
        },
        savingsGoals: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        debtLoans: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        recurringPayments: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        receipts: {
          orderBy: { uploadedAt: "desc" },
          take: 5,
        },
        notifications: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        groupMemberships: {
          where: { status: "active" },
          include: {
            group: {
              select: {
                id: true,
                name: true,
                _count: { select: { members: true, transactions: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            wallets: true,
            categories: true,
            transactions: true,
            budgets: true,
            savingsGoals: true,
            recurringPayments: true,
            debtLoans: true,
            notifications: true,
            receipts: true,
            groupMemberships: true,
          },
        },
      },
    });

    if (!user) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    return Response.json({ error: error.message }, { status: errorStatus(error.message) });
  }
}

export async function PUT(request, { params }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const payload = adminUserUpdateSchema.parse(await request.json());
    const existing = await ensureAdminMutationAllowed({
      targetUserId: id,
      nextRole: payload.role,
      actingUserId: admin.id,
    });

    const duplicateUser = await prisma.user.findFirst({
      where: {
        email: payload.email,
        NOT: { id },
      },
      select: { id: true },
    });

    if (duplicateUser) {
      return Response.json({ error: "Email is already in use" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: payload.name,
        email: payload.email,
        role: payload.role,
        defaultCurrencyId: payload.defaultCurrencyId || null,
        emailVerified: payload.emailVerified ? existing.emailVerified || new Date() : null,
      },
      include: {
        defaultCurrency: { select: { id: true, code: true, symbol: true } },
        _count: {
          select: {
            wallets: true,
            transactions: true,
            groupMemberships: true,
            receipts: true,
          },
        },
      },
    });

    publishGlobalLiveEvent({ resource: "admin-users", action: "updated" });

    return Response.json(user);
  } catch (error) {
    return Response.json({ error: error.message }, { status: error.name === "ZodError" ? 400 : errorStatus(error.message) });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    await ensureAdminMutationAllowed({
      targetUserId: id,
      actingUserId: admin.id,
      deleting: true,
    });

    await prisma.user.delete({ where: { id } });
    publishGlobalLiveEvent({ resource: "admin-users", action: "deleted" });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: errorStatus(error.message) });
  }
}
