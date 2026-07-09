import { requireUser } from "../../../../../lib/auth.js";
import { createAuditLog } from "../../../../../lib/audit.js";
import { createAuthenticatedResponse, markUserLoggedIn } from "../../../../../lib/auth-session.js";
import { prisma } from "../../../../../lib/prisma.js";
import { assertTrustedOrigin } from "../../../../../lib/security.js";
import { verifySocialEmailLinkSchema } from "../../../../../lib/validators/index.js";

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
    const payload = verifySocialEmailLinkSchema.parse(await request.json());
    const email = payload.email.toLowerCase();
    const provider = getLinkedSocialProvider(user);

    if (!provider) {
      return Response.json({ error: "No social provider is available for linking" }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: { email },
      include: { defaultCurrency: true },
    });

    if (!existingUser || existingUser.id === user.id) {
      return Response.json({ error: "Existing account not found" }, { status: 404 });
    }

    const verification = await prisma.verificationToken.findFirst({
      where: {
        token: payload.code,
        identifier: buildSocialLinkIdentifier(user.id, existingUser.id, email),
      },
    });

    if (!verification || verification.expires < new Date()) {
      return Response.json({ error: "Verification code is invalid or expired" }, { status: 400 });
    }

    const providerField = `${provider}Id`;
    const socialId = user[providerField];
    if (!socialId) {
      return Response.json({ error: "Social account identifier is missing" }, { status: 400 });
    }

    const linked = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        [providerField]: socialId,
        avatar: existingUser.avatar || existingUser.image || user.avatar || user.image || null,
        image: existingUser.image || existingUser.avatar || user.image || user.avatar || null,
        emailVerified: existingUser.emailVerified || new Date(),
        providerMeta: {
          ...(existingUser.providerMeta && typeof existingUser.providerMeta === "object" ? existingUser.providerMeta : {}),
          ...(user.providerMeta && typeof user.providerMeta === "object" ? user.providerMeta : {}),
        },
      },
      include: { defaultCurrency: true },
    });

    await prisma.account.updateMany({
      where: {
        provider,
        providerAccountId: socialId,
      },
      data: {
        userId: existingUser.id,
      },
    });

    await prisma.verificationToken.deleteMany({
      where: {
        identifier: buildSocialLinkIdentifier(user.id, existingUser.id, email),
      },
    });

    if (!user.password && !user.email) {
      await prisma.user.delete({
        where: { id: user.id },
      });
    }

    await createAuditLog({
      actorUserId: linked.id,
      action: "auth.link_social_account",
      entityType: "user",
      entityId: linked.id,
      description: `Linked ${provider} account after email verification`,
      meta: {
        provider,
        email,
      },
      request,
    });

    const refreshed = await markUserLoggedIn(linked.id, provider);
    return createAuthenticatedResponse(refreshed);
  } catch (error) {
    const status = error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN_ORIGIN" ? 403 : error.name === "ZodError" ? 400 : 500;
    return Response.json({ error: error.message }, { status });
  }
}
