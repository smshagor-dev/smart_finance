import { requireUser } from "./auth.js";
import { convertBetweenCurrencies } from "./currency.js";
import { prisma } from "./prisma.js";
import { toNumber } from "./utils.js";
import {
  aiInsightSchema,
  budgetSchema,
  categorySchema,
  currencySchema,
  debtPaymentSchema,
  debtSchema,
  groupSchema,
  notificationSchema,
  recurringSchema,
  savingsContributionSchema,
  savingsGoalSchema,
  transactionSchema,
  walletSchema,
} from "./validators/index.js";
import {
  createDebtPayment,
  createSavingsContribution,
  createTransactionWithBalance,
  deleteDebtPayment,
  deleteSavingsContribution,
  deleteTransactionWithBalance,
  updateTransactionWithBalance,
} from "./finance.js";
import { getAccessibleGroupIds } from "./groups.js";
import { publishGlobalLiveEvent, publishLiveEvent } from "./live-events.js";
import { createErrorResponse } from "./http-error.js";

const includeMap = {
  categories: {},
  wallets: { currency: true },
  budgets: { category: true, wallet: true },
  transactions: { category: true, wallet: true, currency: true, group: true },
  "savings-goals": { contributions: true },
  "savings-contributions": { savingsGoal: true },
  recurring: { category: true, wallet: true },
  debts: { payments: true },
  "debt-payments": { debtLoan: true },
  notifications: {},
  "ai-insights": {},
  receipts: { transaction: true },
  currencies: {},
  groups: { members: { include: { user: true } } },
};

const schemaMap = {
  categories: categorySchema,
  wallets: walletSchema,
  budgets: budgetSchema,
  transactions: transactionSchema,
  "savings-goals": savingsGoalSchema,
  "savings-contributions": savingsContributionSchema,
  recurring: recurringSchema,
  debts: debtSchema,
  "debt-payments": debtPaymentSchema,
  notifications: notificationSchema,
  "ai-insights": aiInsightSchema,
  currencies: currencySchema,
  groups: groupSchema,
};

const modelMap = {
  categories: prisma.category,
  wallets: prisma.wallet,
  budgets: prisma.budget,
  transactions: prisma.transaction,
  "savings-goals": prisma.savingsGoal,
  "savings-contributions": prisma.savingsContribution,
  recurring: prisma.recurringPayment,
  debts: prisma.debtLoan,
  "debt-payments": prisma.debtPayment,
  notifications: prisma.notification,
  "ai-insights": prisma.aIInsight,
  receipts: prisma.receipt,
  currencies: prisma.currency,
  groups: prisma.financeGroup,
};

function parseSearchParams(request) {
  const { searchParams } = new URL(request.url);
  return {
    page: Number(searchParams.get("page") || 1),
    pageSize: Number(searchParams.get("pageSize") || 10),
    search: searchParams.get("search") || "",
    type: searchParams.get("type") || "",
    categoryId: searchParams.get("categoryId") || "",
    walletId: searchParams.get("walletId") || "",
    groupId: searchParams.get("groupId") || "",
    from: searchParams.get("from") || "",
    to: searchParams.get("to") || "",
    sort: searchParams.get("sort") || "newest",
  };
}

async function ownershipWhere(resource, userId) {
  if (resource === "currencies") return {};
  if (resource === "groups") return { members: { some: { userId, status: "active" } } };
  if (resource === "categories") return { OR: [{ userId }, { isDefault: true }] };
  if (resource === "transactions") {
    const groupIds = await getAccessibleGroupIds(userId);
    return groupIds.length ? { OR: [{ userId }, { groupId: { in: groupIds } }] } : { userId };
  }
  return { userId };
}

function searchWhere(resource, params) {
  const and = [];
  if (params.search) {
    const fieldMap = {
      transactions: [{ note: { contains: params.search } }, { incomeSource: { contains: params.search } }],
      debts: [{ personName: { contains: params.search } }, { note: { contains: params.search } }],
      categories: [{ name: { contains: params.search } }],
      wallets: [{ name: { contains: params.search } }, { type: { contains: params.search } }],
      budgets: [],
      "savings-goals": [{ title: { contains: params.search } }, { note: { contains: params.search } }],
      "savings-contributions": [{ note: { contains: params.search } }],
      recurring: [{ title: { contains: params.search } }],
      notifications: [{ title: { contains: params.search } }, { message: { contains: params.search } }],
      "ai-insights": [{ title: { contains: params.search } }, { description: { contains: params.search } }],
      receipts: [{ originalName: { contains: params.search } }],
      currencies: [{ code: { contains: params.search } }, { name: { contains: params.search } }],
      groups: [{ name: { contains: params.search } }, { description: { contains: params.search } }],
    };
    const searchFields = fieldMap[resource] || [];
    if (searchFields.length) {
      and.push({ OR: searchFields });
    }
  }
  if (params.type) and.push({ type: params.type });
  if (params.categoryId) and.push({ categoryId: params.categoryId });
  if (params.walletId) and.push({ walletId: params.walletId });
  if (params.groupId) and.push({ groupId: params.groupId });
  if (params.from || params.to) {
    const dateField =
      resource === "transactions"
        ? "transactionDate"
        : resource === "savings-contributions"
          ? "contributionDate"
          : resource === "debt-payments"
            ? "paymentDate"
            : resource === "recurring"
              ? "nextDueDate"
              : "createdAt";
    and.push({
      [dateField]: {
        ...(params.from ? { gte: new Date(params.from) } : {}),
        ...(params.to ? { lte: new Date(params.to) } : {}),
      },
    });
  }
  return and.length ? { AND: and } : {};
}

function sortBy(resource, sort) {
  const field =
    resource === "transactions"
      ? "transactionDate"
      : resource === "savings-contributions"
        ? "contributionDate"
        : resource === "debt-payments"
          ? "paymentDate"
          : "createdAt";

  if (sort === "oldest") return { [field]: "asc" };
  if (sort === "amount") return { amount: "desc" };
  return { [field]: "desc" };
}

function sanitizePayload(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined).map(([key, value]) => [key, value === "" ? null : value]),
  );
}

function getCreationNotificationMeta(resource, item) {
  const actionMap = {
    transactions: {
      title: item?.type === "expense" ? "New expense added" : item?.type === "transfer" ? "New transfer added" : "New income added",
      message: "A new transaction was saved to your account.",
      type: item?.type === "income" ? "savings" : "balance",
      actionUrl: "/dashboard",
    },
    wallets: {
      title: "New wallet created",
      message: `Wallet "${item?.name || "Untitled wallet"}" was added successfully.`,
      type: "balance",
      actionUrl: "/dashboard/wallets",
    },
    categories: {
      title: "Category created",
      message: `Category "${item?.name || "Untitled category"}" is ready to use.`,
      type: "system",
      actionUrl: "/dashboard/categories",
    },
    budgets: {
      title: "Budget created",
      message: "A new budget has been added to your planner.",
      type: "budget",
      actionUrl: "/dashboard/budgets",
    },
    "savings-goals": {
      title: "Savings goal created",
      message: `Goal "${item?.title || "Untitled goal"}" was created successfully.`,
      type: "savings",
      actionUrl: "/dashboard/savings-goals",
    },
    "savings-contributions": {
      title: "Savings contribution added",
      message: "A new savings contribution was recorded.",
      type: "savings",
      actionUrl: "/dashboard/savings-goals",
    },
    recurring: {
      title: "Recurring payment created",
      message: `Recurring payment "${item?.title || "Untitled recurring payment"}" is now active.`,
      type: "bill",
      actionUrl: "/dashboard/recurring",
    },
    debts: {
      title: "Debt or loan added",
      message: `Entry for "${item?.personName || "debt record"}" was created successfully.`,
      type: "balance",
      actionUrl: "/dashboard/debts",
    },
    "debt-payments": {
      title: "Debt payment added",
      message: "A new debt payment was recorded.",
      type: "balance",
      actionUrl: "/dashboard/debts",
    },
    "ai-insights": {
      title: "New insight generated",
      message: item?.title || "A fresh AI insight is ready for review.",
      type: "insight",
      actionUrl: "/dashboard",
    },
    groups: {
      title: "Group created",
      message: `Group "${item?.name || "Untitled group"}" is ready to use.`,
      type: "system",
      actionUrl: "/dashboard/groups",
    },
    receipts: {
      title: "Receipt uploaded",
      message: `File "${item?.originalName || "receipt"}" was uploaded successfully.`,
      type: "system",
      actionUrl: "/dashboard/receipts",
    },
  };

  return actionMap[resource] || null;
}

export async function createInsertNotification({ userId, resource, item }) {
  if (!userId || resource === "notifications" || resource === "currencies") {
    return;
  }

  const meta = getCreationNotificationMeta(resource, item);
  if (!meta) {
    return;
  }

  await prisma.notification.create({
    data: {
      userId,
      title: meta.title,
      message: meta.message,
      type: meta.type,
      actionUrl: meta.actionUrl,
    },
  });

  publishLiveEvent({ userId, resource: "notifications", action: "created" });
}

async function buildListSummary(resource, user, where, params) {
  const defaultCurrencyCode = user.defaultCurrency?.code || "USD";
  const defaultRate = toNumber(user.defaultCurrency?.exchangeRateToUsd, 1);

  if (resource === "transactions") {
    const result = await prisma.transaction.aggregate({
      _sum: { convertedAmount: true },
      where,
    });

    return {
      label:
        params.type === "income"
          ? "Total Income"
          : params.type === "expense"
            ? "Total Expense"
            : params.type === "transfer"
              ? "Total Transfer"
              : "Total Amount",
      value: toNumber(result._sum.convertedAmount),
      currencyCode: defaultCurrencyCode,
    };
  }

  if (resource === "wallets") {
    const wallets = await prisma.wallet.findMany({
      where,
      include: { currency: true },
    });

    return {
      label: "Total Balance",
      value: wallets.reduce(
        (sum, wallet) => sum + convertBetweenCurrencies(wallet.balance, wallet.currency?.exchangeRateToUsd || 1, defaultRate),
        0,
      ),
      currencyCode: defaultCurrencyCode,
    };
  }

  if (resource === "budgets") {
    const result = await prisma.budget.aggregate({
      _sum: { amount: true },
      where,
    });

    return {
      label: "Total Budget",
      value: toNumber(result._sum.amount),
      currencyCode: defaultCurrencyCode,
    };
  }

  if (resource === "recurring") {
    const result = await prisma.recurringPayment.aggregate({
      _sum: { amount: true },
      where,
    });

    return {
      label: "Total Recurring",
      value: toNumber(result._sum.amount),
      currencyCode: defaultCurrencyCode,
    };
  }

  return null;
}

export function createListHandler(resource) {
  return async function GET(request) {
    try {
      const user = await requireUser();
      const params = parseSearchParams(request);
      const model = modelMap[resource];
      const scopedWhere = await ownershipWhere(resource, user.id);
      const where = {
        ...scopedWhere,
        ...searchWhere(resource, params),
      };

      const [items, total, summary] = await Promise.all([
        model.findMany({
          where,
          include: includeMap[resource],
          skip: (params.page - 1) * params.pageSize,
          take: params.pageSize,
          orderBy: sortBy(resource, params.sort),
        }),
        model.count({ where }),
        buildListSummary(resource, user, where, params),
      ]);

      return Response.json({
        items,
        summary,
        pagination: {
          page: params.page,
          pageSize: params.pageSize,
          total,
          totalPages: Math.ceil(total / params.pageSize),
        },
      });
    } catch (error) {
      return createErrorResponse(`GET /api/${resource}`, error);
    }
  };
}

export function createPostHandler(resource) {
  return async function POST(request) {
    try {
      const user = await requireUser();
      if (resource === "currencies" && user.role !== "admin") {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
      const payload = sanitizePayload(await request.json());
      const schema = schemaMap[resource];
      const data = schema ? schema.parse(payload) : payload;

      let item;
      if (resource === "transactions") {
        item = await createTransactionWithBalance(user.id, data);
      } else if (resource === "savings-contributions") {
        item = await createSavingsContribution(user.id, data);
      } else if (resource === "debt-payments") {
        item = await createDebtPayment(user.id, data);
      } else if (resource === "groups") {
        item = await prisma.financeGroup.create({
          data: {
            ...data,
            ownerId: user.id,
            members: {
              create: {
                userId: user.id,
                role: "owner",
                status: "active",
              },
            },
          },
          include: includeMap[resource],
        });
      } else {
        const createData =
          resource === "currencies"
            ? data
            : resource === "categories"
              ? { ...data, userId: data.isDefault ? null : user.id }
              : { ...data, userId: user.id };
        item = await modelMap[resource].create({
          data: createData,
          include: includeMap[resource],
        });
      }

      await createInsertNotification({ userId: user.id, resource, item });

      if (resource === "currencies") {
        publishGlobalLiveEvent({ resource, action: "created" });
      } else {
        publishLiveEvent({ userId: user.id, resource, action: "created" });
      }

      return Response.json(item, { status: 201 });
    } catch (error) {
      return createErrorResponse(`POST /api/${resource}`, error);
    }
  };
}

export function createItemGetHandler(resource) {
  return async function GET(_request, { params }) {
    try {
      const user = await requireUser();
      const { id } = await params;
      const item = await modelMap[resource].findFirst({
        where: {
          id,
          ...(await ownershipWhere(resource, user.id)),
        },
        include: includeMap[resource],
      });

      if (!item) {
        return Response.json({ error: "Not found" }, { status: 404 });
      }

      return Response.json(item);
    } catch (error) {
      return createErrorResponse(`GET /api/${resource}/[id]`, error);
    }
  };
}

export function createPutHandler(resource) {
  return async function PUT(request, { params }) {
    try {
      const user = await requireUser();
      if (resource === "currencies" && user.role !== "admin") {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
      const { id } = await params;
      const payload = sanitizePayload(await request.json());
      const schema = schemaMap[resource];
      const data = schema ? schema.parse(payload) : payload;

      let item;
      if (resource === "transactions") {
        item = await updateTransactionWithBalance(user.id, id, data);
      } else {
        const existing = await modelMap[resource].findFirst({
          where: { id, ...(await ownershipWhere(resource, user.id)) },
        });
        if (!existing) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }
        if (resource === "categories" && !existing.userId) {
          return Response.json({ error: "Default categories cannot be edited" }, { status: 403 });
        }

        item = await modelMap[resource].update({
          where: { id },
          data,
          include: includeMap[resource],
        });
      }

      if (resource === "currencies") {
        publishGlobalLiveEvent({ resource, action: "updated" });
      } else {
        publishLiveEvent({ userId: user.id, resource, action: "updated" });
      }

      return Response.json(item);
    } catch (error) {
      return createErrorResponse(`PUT /api/${resource}/[id]`, error);
    }
  };
}

export function createDeleteHandler(resource) {
  return async function DELETE(_request, { params }) {
    try {
      const user = await requireUser();
      if (resource === "currencies" && user.role !== "admin") {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
      const { id } = await params;
      if (resource === "transactions") {
        await deleteTransactionWithBalance(user.id, id);
      } else if (resource === "savings-contributions") {
        await deleteSavingsContribution(user.id, id);
      } else if (resource === "debt-payments") {
        await deleteDebtPayment(user.id, id);
      } else {
        const existing = await modelMap[resource].findFirst({
          where: { id, ...(await ownershipWhere(resource, user.id)) },
        });
        if (!existing) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }
        if (resource === "categories" && !existing.userId) {
          return Response.json({ error: "Default categories cannot be deleted" }, { status: 403 });
        }
        await modelMap[resource].delete({ where: { id } });
      }

      if (resource === "currencies") {
        publishGlobalLiveEvent({ resource, action: "deleted" });
      } else {
        publishLiveEvent({ userId: user.id, resource, action: "deleted" });
      }

      return Response.json({ success: true });
    } catch (error) {
      return createErrorResponse(`DELETE /api/${resource}/[id]`, error);
    }
  };
}
