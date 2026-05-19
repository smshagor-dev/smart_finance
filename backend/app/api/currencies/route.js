import { requireUser } from "../../../lib/auth.js";
import { prisma } from "../../../lib/prisma.js";
import { createPostHandler } from "../../../lib/api.js";

export async function GET(request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const pageSize = Math.max(1, Math.min(100, Number(searchParams.get("pageSize") || searchParams.get("limit") || 20)));
    const search = String(searchParams.get("search") || "").trim();
    const includeInactive = user.role === "admin" && searchParams.get("includeInactive") === "true";

    const where = {
      ...(includeInactive ? {} : { isActive: true }),
      ...(search
        ? {
            OR: [
              { code: { contains: search } },
              { name: { contains: search } },
              { symbol: { contains: search } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.currency.findMany({
        where,
        orderBy: [{ code: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.currency.count({ where }),
    ]);

    return Response.json({
      items: items.map((currency) => ({
        id: currency.id,
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        country: null,
        flag: null,
        exchangeRate: currency.exchangeRateToUsd,
        exchangeRateToUsd: currency.exchangeRateToUsd,
        isActive: currency.isActive,
        lastSyncedAt: currency.lastSyncedAt,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
        hasMore: page * pageSize < total,
      },
    });
  } catch (error) {
    const status = error.message === "UNAUTHORIZED" ? 401 : 500;
    return Response.json({ error: error.message }, { status });
  }
}

export const POST = createPostHandler("currencies");
