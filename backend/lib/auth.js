import { prisma } from "./prisma.js";
import { isMissingTableError } from "./prisma-errors.js";
import { getSessionPayload } from "./session.js";

export async function getCurrentUser() {
  const session = getSessionPayload();
  if (!session?.sub) {
    return null;
  }

  try {
    return await prisma.user.findUnique({
      where: { id: session.sub },
      include: {
        settings: true,
        defaultCurrency: true,
      },
    });
  } catch (error) {
    if (isMissingTableError(error)) {
      return null;
    }

    throw error;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return user;
}
