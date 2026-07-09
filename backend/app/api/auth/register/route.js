import { prisma } from "../../../../lib/prisma.js";
import { hashPassword } from "../../../../lib/password.js";
import { getSiteSettings } from "../../../../lib/site-settings.js";
import { ensureUserFinanceSetup } from "../../../../lib/user.js";
import { registerSchema } from "../../../../lib/validators/index.js";
import { issueVerificationCode } from "../../../../lib/verification.js";
import { createErrorResponse } from "../../../../lib/http-error.js";
import { assertTrustedOrigin, getDeviceTypeFromUserAgent } from "../../../../lib/security.js";
import { createAuditLog } from "../../../../lib/audit.js";

export async function POST(request) {
  try {
    assertTrustedOrigin(request);
    const payload = registerSchema.parse(await request.json());
    const exists = await prisma.user.findFirst({ where: { email: payload.email } });
    if (exists) {
      return Response.json({ error: "Email is already registered" }, { status: 409 });
    }

    const siteSettings = await getSiteSettings();
    const isFirstUser = (await prisma.user.count()) === 0;

    const password = await hashPassword(payload.password);
    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password,
        role: isFirstUser ? "admin" : "user",
        registrationProvider: "email",
        emailVerified: siteSettings.requireEmailVerification ? null : new Date(),
        defaultCurrencyId: payload.defaultCurrencyId || (await prisma.currency.findUnique({ where: { code: "USD" } }))?.id || null,
      },
    });

    await ensureUserFinanceSetup(user.id, user.defaultCurrencyId);
    await createAuditLog({
      actorUserId: user.id,
      action: "auth.register",
      entityType: "user",
      entityId: user.id,
      description: "User registered with email and password",
      meta: {
        provider: "email",
        deviceType: getDeviceTypeFromUserAgent(request.headers.get("user-agent")),
        requiresVerification: siteSettings.requireEmailVerification,
      },
      request,
    });
    let verificationDelivery = null;
    if (siteSettings.requireEmailVerification) {
      verificationDelivery = await issueVerificationCode({
        identifier: payload.email.toLowerCase(),
        recipientEmail: payload.email,
        recipientName: payload.name,
      });
    }

    const fallbackMessage =
      verificationDelivery && !verificationDelivery.sent
        ? `Email delivery is unavailable in this environment. Use verification code ${verificationDelivery.code}.`
        : null;

    return Response.json({
      success: true,
      requiresVerification: siteSettings.requireEmailVerification,
      email: payload.email,
      ...(verificationDelivery && !verificationDelivery.sent ? { devVerificationCode: verificationDelivery.code } : {}),
      message: siteSettings.requireEmailVerification
        ? fallbackMessage || "Registration complete. Verify your email with the 6-digit code."
        : "Registration complete. Your account is ready to use.",
    });
  } catch (error) {
    return createErrorResponse("POST /api/auth/register", error, {
      publicMessage:
        error.name === "ZodError"
          ? error.message
          : "Registration failed. Please check your email settings and try again.",
      status: error.message === "FORBIDDEN_ORIGIN" ? 403 : undefined,
    });
  }
}
