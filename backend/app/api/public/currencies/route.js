import { prisma } from "../../../../lib/prisma.js";
import { isMissingTableError } from "../../../../lib/prisma-errors.js";

export async function GET() {
  try {
    const items = await prisma.currency.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
    });

    return Response.json({ items });
  } catch (error) {
    if (isMissingTableError(error)) {
      return Response.json({ items: [] });
    }

    throw error;
  }
}
