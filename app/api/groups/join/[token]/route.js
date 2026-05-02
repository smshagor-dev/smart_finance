import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { publishLiveEvent } from "@/lib/live-events";
import { prisma } from "@/lib/prisma";

async function getInviteByToken(token) {
  return prisma.financeGroupInvite.findUnique({
    where: { token },
    include: {
      group: {
        include: {
          owner: { select: { id: true, name: true, email: true, image: true } },
          members: {
            where: { status: "active" },
            include: { user: { select: { id: true, name: true, email: true, image: true } } },
          },
        },
      },
    },
  });
}

function inviteIsUsable(invite) {
  return Boolean(invite && invite.isActive && invite.expiresAt > new Date() && invite.usesCount < invite.maxUses);
}

export async function GET(_request, { params }) {
  try {
    const user = await requireUser();
    const { token } = await params;
    const invite = await getInviteByToken(token);

    if (!inviteIsUsable(invite)) {
      return NextResponse.json({ error: "Invite link is invalid or expired" }, { status: 404 });
    }

    const existingMembership = invite.group.members.find((member) => member.userId === user.id && member.status === "active");

    return NextResponse.json({
      token,
      group: {
        id: invite.group.id,
        name: invite.group.name,
        description: invite.group.description,
        owner: invite.group.owner,
        membersCount: invite.group.members.length,
      },
      alreadyJoined: Boolean(existingMembership),
      expiresAt: invite.expiresAt,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: error.message === "UNAUTHORIZED" ? 401 : 500 });
  }
}

export async function POST(_request, { params }) {
  try {
    const user = await requireUser();
    const { token } = await params;
    const invite = await getInviteByToken(token);

    if (!inviteIsUsable(invite)) {
      return NextResponse.json({ error: "Invite link is invalid or expired" }, { status: 404 });
    }

    const existingMembership = invite.group.members.find((member) => member.userId === user.id);

    if (existingMembership?.status === "active") {
      return NextResponse.json({ success: true, alreadyJoined: true, groupId: invite.group.id });
    }

    await prisma.$transaction(async (tx) => {
      if (existingMembership) {
        await tx.financeGroupMember.update({
          where: { id: existingMembership.id },
          data: {
            status: "active",
            role: existingMembership.role === "viewer" ? "member" : existingMembership.role,
          },
        });
      } else {
        await tx.financeGroupMember.create({
          data: {
            groupId: invite.group.id,
            userId: user.id,
            role: "member",
            status: "active",
          },
        });
      }

      await tx.financeGroupInvite.update({
        where: { id: invite.id },
        data: {
          usesCount: {
            increment: 1,
          },
        },
      });

      await tx.notification.create({
        data: {
          userId: invite.group.ownerId,
          title: "New group member joined",
          message: `${user.name || user.email || "A member"} joined ${invite.group.name}.`,
          type: "system",
          actionUrl: `/dashboard/groups/${invite.group.id}`,
        },
      });
    });

    for (const member of invite.group.members) {
      publishLiveEvent({ userId: member.userId, resource: "groups", action: "updated" });
    }
    publishLiveEvent({ userId: user.id, resource: "groups", action: "updated" });
    publishLiveEvent({ userId: invite.group.ownerId, resource: "notifications", action: "created" });

    return NextResponse.json({
      success: true,
      groupId: invite.group.id,
      groupName: invite.group.name,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: error.message === "UNAUTHORIZED" ? 401 : 500 });
  }
}
