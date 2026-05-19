import { requireUser } from "../../../../lib/auth.js";
import { createAuditLog } from "../../../../lib/audit.js";
import { createAuthenticatedResponse, markUserLoggedIn } from "../../../../lib/auth-session.js";
import { prisma } from "../../../../lib/prisma.js";
import { assertTrustedOrigin } from "../../../../lib/security.js";
import { completeSocialEmailSchema } from "../../../../lib/validators/index.js";
import { issueVerificationCode } from "../../../../lib/verification.js";

function getLinkedSocialProvider(user) {
  if (user.googleId) return "google";
  if (user.facebookId) return "facebook";
  if (user.telegramId) return "telegram";
  return null;
}

function buildSocialLinkIdentifier(tempUserId, existingUserId, email) {
  return `social-link:${tempUserId}:${existingUserId}:${String(email).toLowerCase()}`;
}

export async function POST(request) {
  try {
    assertTrustedOrigin(request);
    const user = await requireUser();
    const payload = completeSocialEmailSchema.parse(await request.json());
    const nextEmail = payload.email.toLowerCase();

    if (user.email && user.email.toLowerCase() === nextEmail) {
      const refreshed = await markUserLoggedIn(user.id, getLinkedSocialProvider(user) || "email");
      return createAuthenticatedResponse(refreshed);
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email: nextEmail,
        NOT: { id: user.id },
      },
      include: { defaultCurrency: true },
    });

    if (!existingUser) {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          email: nextEmail,
          emailVerified: new Date(),
        },
        include: { defaultCurrency: true },
      });

      await createAuditLog({
        actorUserId: updated.id,
        action: "auth.complete_email",
        entityType: "user",
        entityId: updated.id,
        description: "Social account email completed",
        meta: {
          email: nextEmail,
          provider: getLinkedSocialProvider(updated),
        },
        request,
      });

      const refreshed = await markUserLoggedIn(updated.id, getLinkedSocialProvider(updated) || "email");
      return createAuthenticatedResponse(refreshed);
    }

    const verificationDelivery = await issueVerificationCode({
      identifier: buildSocialLinkIdentifier(user.id, existingUser.id, nextEmail),
      recipientEmail: nextEmail,
      recipientName: existingUser.name || user.name || "Finance Tracker user",
    });

    return Response.json({
      success: true,
      requiresVerification: true,
      message: verificationDelivery.sent
        ? "A verification code has been sent to link this account."
        : `Email delivery is unavailable in this environment. Use verification code ${verificationDelivery.code}.`,
      ...(verificationDelivery.sent ? {} : { devVerificationCode: verificationDelivery.code }),
    });
  } catch (error) {
    const status = error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN_ORIGIN" ? 403 : error.name === "ZodError" ? 400 : 500;
    return Response.json({ error: error.message }, { status });
  }
}
