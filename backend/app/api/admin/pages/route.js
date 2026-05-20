import { requireAdmin } from "../../../../lib/auth.js";
import {
  ensureUniquePageSlug,
  isValidPageSlug,
  normalizePageText,
  resolvePublishedAt,
  sanitizePageContent,
  sanitizePageSlug,
  serializeCustomPage,
} from "../../../../lib/custom-pages.js";
import { prisma } from "../../../../lib/prisma.js";
import { customPageSchema } from "../../../../lib/validators/index.js";

function parseParams(request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.max(1, Math.min(50, Number(searchParams.get("pageSize") || 10)));
  const search = String(searchParams.get("search") || "").trim();
  const status = String(searchParams.get("status") || "").trim();

  return { page, pageSize, search, status };
}

function buildWhere(params) {
  return {
    ...(params.status ? { status: params.status } : {}),
    ...(params.search
      ? {
          OR: [
            { title: { contains: params.search } },
            { slug: { contains: params.search } },
          ],
        }
      : {}),
  };
}

export async function GET(request) {
  try {
    await requireAdmin();
    const params = parseParams(request);
    const where = buildWhere(params);

    const [items, total] = await Promise.all([
      prisma.customPage.findMany({
        where,
        orderBy: [
          { publishedAt: "desc" },
          { updatedAt: "desc" },
        ],
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      prisma.customPage.count({ where }),
    ]);

    return Response.json({
      items: items.map(serializeCustomPage),
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

export async function POST(request) {
  try {
    await requireAdmin();
    const payload = customPageSchema.parse(await request.json());
    const slug = sanitizePageSlug(payload.slug || payload.title);
    if (!slug || !isValidPageSlug(slug)) {
      return Response.json({ error: "Slug must contain only letters, numbers, and hyphens" }, { status: 400 });
    }

    if (!(await ensureUniquePageSlug(slug))) {
      return Response.json({ error: "A page with this slug already exists" }, { status: 409 });
    }

    const content = sanitizePageContent(payload.content);
    if (!content) {
      return Response.json({ error: "Content is required" }, { status: 400 });
    }

    const item = await prisma.customPage.create({
      data: {
        title: payload.title.trim(),
        slug,
        shortDescription: normalizePageText(payload.shortDescription),
        content,
        metaTitle: normalizePageText(payload.metaTitle),
        metaDescription: normalizePageText(payload.metaDescription),
        metaKeywords: normalizePageText(payload.metaKeywords),
        status: payload.status,
        publishedAt: resolvePublishedAt(payload.status),
      },
    });

    return Response.json({ item: serializeCustomPage(item) }, { status: 201 });
  } catch (error) {
    const status =
      error.message === "UNAUTHORIZED"
        ? 401
        : error.message === "FORBIDDEN"
          ? 403
          : error?.code === "P2002"
            ? 409
            : error.name === "ZodError"
              ? 400
              : 500;
    return Response.json({ error: error.message }, { status });
  }
}
