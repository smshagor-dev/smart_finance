import { requireUser } from "../../../../lib/auth.js";
import { publishLiveEvent } from "../../../../lib/live-events.js";
import { prisma } from "../../../../lib/prisma.js";

export async function POST() {
  try {
    const user = await requireUser();

    const result = await prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    publishLiveEvent({ userId: user.id, resource: "notifications", action: "updated" });

    return Response.json({
      success: true,
      updatedCount: result.count,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: error.message === "UNAUTHORIZED" ? 401 : 500 });
  }
}
