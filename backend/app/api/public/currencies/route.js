import { prisma } from "../../../../lib/prisma.js";

export async function GET() {
  const items = await prisma.currency.findMany({
    where: { isActive: true },
    orderBy: { code: "asc" },
  });

  return Response.json({ items });
}
