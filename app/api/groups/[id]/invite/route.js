import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { buildGroupInviteLink, createGroupInvite, requireGroupAccess } from "@/lib/groups";
import { publishLiveEvent } from "@/lib/live-events";
import { groupInviteSchema } from "@/lib/validators";

export async function POST(request, { params }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const payload = groupInviteSchema.parse(await request.json());
    const membership = await requireGroupAccess(user.id, id);

    if (!["owner", "admin"].includes(membership.role)) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const invite = await createGroupInvite({
      groupId: id,
      createdById: user.id,
      expiresInDays: payload.expiresInDays,
      maxUses: payload.maxUses,
    });

    for (const member of membership.group.members) {
      publishLiveEvent({ userId: member.userId, resource: "groups", action: "updated" });
    }

    return NextResponse.json({
      ...invite,
      inviteLink: await buildGroupInviteLink(invite.token),
    });
  } catch (error) {
    const status = error.name === "ZodError" ? 400 : error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
