import { prisma } from "./prisma.js";
import { getCurrentRequest } from "./request-context.js";
import { getRequestIp } from "./security.js";

export async function createAuditLog({
  actorUserId = null,
  action,
  entityType,
  entityId = null,
  description = "",
  meta = null,
  request = getCurrentRequest(),
}) {
  if (!action || !entityType) {
    return null;
  }

  return prisma.auditLog.create({
    data: {
      actorUserId,
      action,
      entityType,
      entityId,
      description: description || null,
      ipAddress: getRequestIp(request) || null,
      meta: meta || undefined,
    },
  });
}
