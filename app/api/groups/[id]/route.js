import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getGroupSharedSnapshot, requireGroupAccess } from "@/lib/groups";
import { publishLiveEvent } from "@/lib/live-events";
import { prisma } from "@/lib/prisma";
import { groupSchema } from "@/lib/validators";

function canManageRole(role) {
  return role === "owner" || role === "admin";
}

export async function GET(_request, { params }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const membership = await requireGroupAccess(user.id, id);
    const snapshot = await getGroupSharedSnapshot(id, user.id);

    const invites = await prisma.financeGroupInvite.findMany({
      where: {
        groupId: id,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      ...membership.group,
      currentUserRole: membership.role,
      currentUserStatus: membership.status,
      canManage: canManageRole(membership.role),
      invites: canManageRole(membership.role)
        ? invites
        : [],
      ...snapshot,
    });
  } catch (error) {
    const status = error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const payload = groupSchema.parse(await request.json());
    const membership = await requireGroupAccess(user.id, id);

    if (!canManageRole(membership.role)) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const group = await prisma.financeGroup.update({
      where: { id },
      data: {
        name: payload.name,
        description: payload.description || null,
      },
    });

    const memberIds = membership.group.members.map((member) => member.userId);
    for (const memberId of memberIds) {
      publishLiveEvent({ userId: memberId, resource: "groups", action: "updated" });
    }

    return NextResponse.json(group);
  } catch (error) {
    const status = error.name === "ZodError" ? 400 : error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const membership = await requireGroupAccess(user.id, id);

    if (membership.role !== "owner") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const memberIds = membership.group.members.map((member) => member.userId);
    await prisma.financeGroup.delete({ where: { id } });

    for (const memberId of memberIds) {
      publishLiveEvent({ userId: memberId, resource: "groups", action: "deleted" });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const status = error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
