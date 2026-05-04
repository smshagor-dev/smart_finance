import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { isMissingTableError } from "@/lib/prisma-errors";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user?.id) {
    return null;
  }

  try {
    return await prisma.user.findUnique({
      where: { id: session.user.id },
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
