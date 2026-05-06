import { requireAdmin } from "../../../../lib/auth.js";
import { prisma } from "../../../../lib/prisma.js";

function parseParams(request) {
  const { searchParams } = new URL(request.url);
  return {
    page: Number(searchParams.get("page") || 1),
    pageSize: Number(searchParams.get("pageSize") || 10),
    search: (searchParams.get("search") || "").trim(),
    role: (searchParams.get("role") || "").trim(),
  };
}

export async function GET(request) {
  try {
    await requireAdmin();
    const params = parseParams(request);
    const where = {
      ...(params.role ? { role: params.role } : {}),
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search } },
              { email: { contains: params.search } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    return Response.json({
      items,
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        total,
        totalPages: Math.ceil(total / params.pageSize) || 1,
      },
    });
  } catch (error) {
    const status = error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : 500;
    return Response.json({ error: error.message }, { status });
  }
}
