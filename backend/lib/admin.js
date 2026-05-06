import { prisma } from "./prisma.js";

export async function ensureAdminMutationAllowed({ targetUserId, nextRole, actingUserId, deleting = false }) {
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, role: true, emailVerified: true },
  });

  if (!targetUser) {
    throw new Error("NOT_FOUND");
  }

  const adminCount = await prisma.user.count({
    where: { role: "admin" },
  });

  const wouldRemoveLastAdmin = targetUser.role === "admin" && adminCount <= 1 && (deleting || nextRole === "user");
  if (wouldRemoveLastAdmin) {
    throw new Error("LAST_ADMIN");
  }

  if (deleting && targetUser.id === actingUserId) {
    throw new Error("SELF_DELETE");
  }

  return targetUser;
}
