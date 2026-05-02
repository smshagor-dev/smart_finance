import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
} from "@/lib/validators";
import {
  createDebtPayment,
  createSavingsContribution,
  createTransactionWithBalance,
  deleteDebtPayment,
  deleteSavingsContribution,
  deleteTransactionWithBalance,
  updateTransactionWithBalance,
} from "@/lib/finance";
import { getAccessibleGroupIds } from "@/lib/groups";
import { publishGlobalLiveEvent, publishLiveEvent } from "@/lib/live-events";

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

      const [items, total] = await Promise.all([
        model.findMany({
          where,
          include: includeMap[resource],
          skip: (params.page - 1) * params.pageSize,
          take: params.pageSize,
          orderBy: sortBy(resource, params.sort),
        }),
        model.count({ where }),
      ]);

      return NextResponse.json({
        items,
        pagination: {
          page: params.page,
          pageSize: params.pageSize,
          total,
          totalPages: Math.ceil(total / params.pageSize),
        },
      });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: error.message === "UNAUTHORIZED" ? 401 : 500 });
    }
  };
}

export function createPostHandler(resource) {
  return async function POST(request) {
    try {
      const user = await requireUser();
      if (resource === "currencies" && user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

      if (resource === "currencies") {
        publishGlobalLiveEvent({ resource, action: "created" });
      } else {
        publishLiveEvent({ userId: user.id, resource, action: "created" });
      }

      return NextResponse.json(item, { status: 201 });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: error.name === "ZodError" ? 400 : error.message === "UNAUTHORIZED" ? 401 : 500 });
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
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      return NextResponse.json(item);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: error.message === "UNAUTHORIZED" ? 401 : 500 });
    }
  };
}

export function createPutHandler(resource) {
  return async function PUT(request, { params }) {
    try {
      const user = await requireUser();
      if (resource === "currencies" && user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
          return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        if (resource === "categories" && !existing.userId) {
          return NextResponse.json({ error: "Default categories cannot be edited" }, { status: 403 });
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

      return NextResponse.json(item);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: error.name === "ZodError" ? 400 : error.message === "UNAUTHORIZED" ? 401 : 500 });
    }
  };
}

export function createDeleteHandler(resource) {
  return async function DELETE(_request, { params }) {
    try {
      const user = await requireUser();
      if (resource === "currencies" && user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
          return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        if (resource === "categories" && !existing.userId) {
          return NextResponse.json({ error: "Default categories cannot be deleted" }, { status: 403 });
        }
        await modelMap[resource].delete({ where: { id } });
      }

      if (resource === "currencies") {
        publishGlobalLiveEvent({ resource, action: "deleted" });
      } else {
        publishLiveEvent({ userId: user.id, resource, action: "deleted" });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: error.message === "UNAUTHORIZED" ? 401 : 500 });
    }
  };
}
