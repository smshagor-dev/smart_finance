import {
  listPublishedPolicyPages,
  serializeCustomPage,
} from "../../../../lib/custom-pages.js";
import { prisma } from "../../../../lib/prisma.js";

export async function GET(_request, { params }) {
  const { slug } = await params;

  if (slug === "policy") {
    const items = await listPublishedPolicyPages();
    return Response.json({ items });
  }

  const item = await prisma.customPage.findFirst({
    where: {
      slug,
      status: "published",
    },
  });

  if (!item) {
    return Response.json({ error: "Page not found" }, { status: 404 });
  }

  return Response.json({ item: serializeCustomPage(item) });
}
