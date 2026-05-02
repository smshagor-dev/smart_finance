import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { publishLiveEvent } from "@/lib/live-events";
import { prisma } from "@/lib/prisma";

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

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: error.message === "UNAUTHORIZED" ? 401 : 500 });
  }
}
