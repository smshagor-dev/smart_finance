import { requireAdmin } from "../../../../../../lib/auth.js";
import { resolvePublishedAt, serializeCustomPage } from "../../../../../../lib/custom-pages.js";
import { prisma } from "../../../../../../lib/prisma.js";
import { customPageStatusSchema } from "../../../../../../lib/validators/index.js";

async function getPageId(params) {
  const { id } = await params;
  return id;
}

export async function PATCH(request, { params }) {
  try {
    await requireAdmin();
    const id = await getPageId(params);
    const existing = await prisma.customPage.findUnique({ where: { id } });

    if (!existing) {
      return Response.json({ error: "Page not found" }, { status: 404 });
    }

    const payload = customPageStatusSchema.parse(await request.json());
    const item = await prisma.customPage.update({
      where: { id },
      data: {
        status: payload.status,
        publishedAt: resolvePublishedAt(payload.status, existing.publishedAt),
      },
    });

    return Response.json({ item: serializeCustomPage(item) });
  } catch (error) {
    const status = error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : error.name === "ZodError" ? 400 : 500;
    return Response.json({ error: error.message }, { status });
  }
}
