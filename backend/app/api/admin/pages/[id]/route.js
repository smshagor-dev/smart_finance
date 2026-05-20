import { requireAdmin } from "../../../../../lib/auth.js";
import {
  ensureUniquePageSlug,
  isValidPageSlug,
  normalizePageText,
  resolvePublishedAt,
  sanitizePageContent,
  sanitizePageSlug,
  serializeCustomPage,
} from "../../../../../lib/custom-pages.js";
import { prisma } from "../../../../../lib/prisma.js";
import { customPageSchema } from "../../../../../lib/validators/index.js";

async function getPageId(params) {
  const { id } = await params;
  return id;
}

export async function GET(_request, { params }) {
  try {
    await requireAdmin();
    const id = await getPageId(params);
    const item = await prisma.customPage.findUnique({ where: { id } });

    if (!item) {
      return Response.json({ error: "Page not found" }, { status: 404 });
    }

    return Response.json({ item: serializeCustomPage(item) });
  } catch (error) {
    const status = error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : 500;
    return Response.json({ error: error.message }, { status });
  }
}

export async function PATCH(request, { params }) {
  try {
    await requireAdmin();
    const id = await getPageId(params);
    const existing = await prisma.customPage.findUnique({ where: { id } });

    if (!existing) {
      return Response.json({ error: "Page not found" }, { status: 404 });
    }

    const payload = customPageSchema.parse(await request.json());
    const slug = sanitizePageSlug(payload.slug || payload.title);
    if (!slug || !isValidPageSlug(slug)) {
      return Response.json({ error: "Slug must contain only letters, numbers, and hyphens" }, { status: 400 });
    }

    if (!(await ensureUniquePageSlug(slug, id))) {
      return Response.json({ error: "A page with this slug already exists" }, { status: 409 });
    }

    const content = sanitizePageContent(payload.content);
    if (!content) {
      return Response.json({ error: "Content is required" }, { status: 400 });
    }

    const item = await prisma.customPage.update({
      where: { id },
      data: {
        title: payload.title.trim(),
        slug,
        shortDescription: normalizePageText(payload.shortDescription),
        content,
        metaTitle: normalizePageText(payload.metaTitle),
        metaDescription: normalizePageText(payload.metaDescription),
        metaKeywords: normalizePageText(payload.metaKeywords),
        status: payload.status,
        publishedAt: resolvePublishedAt(payload.status, existing.publishedAt),
      },
    });

    return Response.json({ item: serializeCustomPage(item) });
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

export async function DELETE(_request, { params }) {
  try {
    await requireAdmin();
    const id = await getPageId(params);
    const existing = await prisma.customPage.findUnique({ where: { id }, select: { id: true } });

    if (!existing) {
      return Response.json({ error: "Page not found" }, { status: 404 });
    }

    await prisma.customPage.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    const status = error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : 500;
    return Response.json({ error: error.message }, { status });
  }
}
