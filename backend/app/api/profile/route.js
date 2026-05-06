import { requireUser } from "../../../lib/auth.js";
import { buildEmailChangeIdentifier, getPendingEmailChange, issueVerificationCode } from "../../../lib/verification.js";
import { publishLiveEvent } from "../../../lib/live-events.js";
import { prisma } from "../../../lib/prisma.js";
import { hashPassword, verifyPassword } from "../../../lib/password.js";
import { profileSchema } from "../../../lib/validators/index.js";

export async function GET() {
  try {
    const user = await requireUser();
    const currencies = await prisma.currency.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
    });
    const pendingEmail = await getPendingEmailChange(user.id);

    return Response.json({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      image: user.image || "",
      role: user.role,
      defaultCurrencyId: user.defaultCurrencyId || "",
      defaultCurrencyCode: user.defaultCurrency?.code || "USD",
      emailVerified: user.emailVerified,
      pendingEmail: pendingEmail || "",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      currencies: currencies.map((currency) => ({
        value: currency.id,
        label: `${currency.code} - ${currency.name || currency.code}`,
      })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: error.message === "UNAUTHORIZED" ? 401 : 500 });
  }
}

export async function PUT(request) {
  try {
    const user = await requireUser();
    const payload = profileSchema.parse(await request.json());

    const requiresSensitiveVerification = Boolean(payload.password) || payload.email.toLowerCase() !== (user.email || "").toLowerCase();
    if (requiresSensitiveVerification) {
      if (!user.password || !payload.currentPassword) {
        return Response.json({ error: "Current password is required" }, { status: 400 });
      }

      const matches = await verifyPassword(payload.currentPassword, user.password);
      if (!matches) {
        return Response.json({ error: "Current password is incorrect" }, { status: 400 });
      }
    }

    const updateData = {
      name: payload.name,
      image: payload.image || null,
      defaultCurrencyId: payload.defaultCurrencyId,
      ...(payload.password ? { password: await hashPassword(payload.password) } : {}),
    };

    let pendingEmail = "";
    if (payload.email.toLowerCase() !== (user.email || "").toLowerCase()) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email: payload.email,
          NOT: { id: user.id },
        },
      });
      if (emailExists) {
        return Response.json({ error: "Email is already in use" }, { status: 409 });
      }

      pendingEmail = payload.email.toLowerCase();
      const identifier = buildEmailChangeIdentifier(user.id, pendingEmail);
      await issueVerificationCode({
        identifier,
        recipientEmail: payload.email,
        recipientName: payload.name,
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    publishLiveEvent({
      userId: user.id,
      resource: "profile",
      action: "updated",
      extraResources: pendingEmail ? ["settings"] : [],
    });

    return Response.json({
      success: true,
      requiresEmailVerification: Boolean(pendingEmail),
      pendingEmail,
      message: pendingEmail
        ? "Profile updated. Verify your new email address to complete the email change."
        : "Profile updated successfully.",
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: error.name === "ZodError" ? 400 : 500 });
  }
}
