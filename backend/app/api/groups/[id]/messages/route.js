import { requireUser } from "../../../../../lib/auth.js";
import { requireGroupAccess } from "../../../../../lib/groups.js";
import { publishLiveEvent } from "../../../../../lib/live-events.js";
import { prisma } from "../../../../../lib/prisma.js";
import { groupMessageSchema } from "../../../../../lib/validators/index.js";

export async function GET(_request, { params }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await requireGroupAccess(user.id, id);

    const items = await prisma.groupMessage.findMany({
      where: { groupId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    return Response.json({ items });
  } catch (error) {
    const status = error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : 500;
    return Response.json({ error: error.message }, { status });
  }
}

export async function POST(request, { params }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const payload = groupMessageSchema.parse(await request.json());
    const membership = await requireGroupAccess(user.id, id);

    const message = await prisma.groupMessage.create({
      data: {
        groupId: id,
        userId: user.id,
        body: payload.body,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    for (const member of membership.group.members) {
      if (member.userId !== user.id) {
        await prisma.notification.create({
          data: {
            userId: member.userId,
            title: `New message in ${membership.group.name}`,
            message: `${user.name || user.email || "A member"} sent a new group message.`,
            type: "system",
            actionUrl: `/dashboard/groups/${id}`,
          },
        });
      }

      publishLiveEvent({ userId: member.userId, resource: "groups", action: "updated" });
      publishLiveEvent({ userId: member.userId, resource: "notifications", action: "created" });
    }

    return Response.json(message, { status: 201 });
  } catch (error) {
    const status = error.name === "ZodError" ? 400 : error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : 500;
    return Response.json({ error: error.message }, { status });
  }
}
