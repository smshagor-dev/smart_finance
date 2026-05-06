import { requireUser } from "../../../lib/auth.js";
import { groupSchema } from "../../../lib/validators/index.js";
import { publishLiveEvent } from "../../../lib/live-events.js";
import { prisma } from "../../../lib/prisma.js";

export async function GET() {
  try {
    const user = await requireUser();

    const memberships = await prisma.financeGroupMember.findMany({
      where: {
        userId: user.id,
        status: "active",
      },
      include: {
        group: {
          include: {
            owner: { select: { id: true, name: true, email: true, image: true } },
            _count: {
              select: {
                members: true,
                transactions: true,
                messages: true,
              },
            },
            invites: {
              where: {
                isActive: true,
                expiresAt: { gt: new Date() },
              },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return Response.json({
      items: memberships.map((membership) => ({
        ...membership.group,
        membershipId: membership.id,
        role: membership.role,
        status: membership.status,
        activeInvite: membership.group.invites[0]
          ? {
              id: membership.group.invites[0].id,
              expiresAt: membership.group.invites[0].expiresAt,
              usesCount: membership.group.invites[0].usesCount,
              maxUses: membership.group.invites[0].maxUses,
            }
          : null,
      })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: error.message === "UNAUTHORIZED" ? 401 : 500 });
  }
}

export async function POST(request) {
  try {
    const user = await requireUser();
    const payload = groupSchema.parse(await request.json());

    const group = await prisma.financeGroup.create({
      data: {
        name: payload.name,
        description: payload.description || null,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: "owner",
            status: "active",
          },
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true, image: true } },
        _count: {
          select: {
            members: true,
            transactions: true,
            messages: true,
          },
        },
      },
    });

    publishLiveEvent({ userId: user.id, resource: "groups", action: "created" });

    return Response.json(group, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: error.name === "ZodError" ? 400 : error.message === "UNAUTHORIZED" ? 401 : 500 });
  }
}
