import { prisma } from "../../../../lib/prisma.js";
import { forgotPasswordSchema } from "../../../../lib/validators/index.js";
import { buildEmailChangeIdentifier, issueVerificationCode } from "../../../../lib/verification.js";
import { createErrorResponse } from "../../../../lib/http-error.js";

export async function POST(request) {
  try {
    const payload = await request.json();
    const emailInput = forgotPasswordSchema.parse({ email: payload.email });
    const purpose = payload.purpose || "signup";
    const user = await prisma.user.findUnique({
      where: { email: emailInput.email },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (purpose === "signup" && user.emailVerified) {
      return Response.json({ error: "Email is already verified" }, { status: 400 });
    }

    const identifier =
      purpose === "email-change" && payload.pendingEmail
        ? buildEmailChangeIdentifier(user.id, payload.pendingEmail)
        : emailInput.email.toLowerCase();
    const recipientEmail = purpose === "email-change" && payload.pendingEmail ? payload.pendingEmail : emailInput.email;

    const verificationDelivery = await issueVerificationCode({
      identifier,
      recipientEmail,
      recipientName: user.name,
    });

    const fallbackMessage =
      verificationDelivery && !verificationDelivery.sent
        ? `Email delivery is unavailable in this environment. Use verification code ${verificationDelivery.code}.`
        : null;

    return Response.json({
      success: true,
      ...(verificationDelivery && !verificationDelivery.sent ? { devVerificationCode: verificationDelivery.code } : {}),
      message:
        fallbackMessage ||
        (purpose === "email-change" ? "A verification code has been sent to your new email." : "A new verification code has been generated."),
    });
  } catch (error) {
    return createErrorResponse("POST /api/auth/resend-verification", error, {
      publicMessage:
        error.name === "ZodError"
          ? error.message
          : "Could not resend the verification code. Please check your email settings and try again.",
    });
  }
}
