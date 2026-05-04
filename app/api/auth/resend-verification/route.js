import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validators";
import { buildEmailChangeIdentifier, issueVerificationCode } from "@/lib/verification";
import { createErrorResponse } from "@/lib/http-error";

export async function POST(request) {
  try {
    const payload = await request.json();
    const emailInput = forgotPasswordSchema.parse({ email: payload.email });
    const purpose = payload.purpose || "signup";
    const user = await prisma.user.findUnique({
      where: { email: emailInput.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (purpose === "signup" && user.emailVerified) {
      return NextResponse.json({ error: "Email is already verified" }, { status: 400 });
    }

    const identifier =
      purpose === "email-change" && payload.pendingEmail
        ? buildEmailChangeIdentifier(user.id, payload.pendingEmail)
        : emailInput.email.toLowerCase();
    const recipientEmail = purpose === "email-change" && payload.pendingEmail ? payload.pendingEmail : emailInput.email;

    await issueVerificationCode({
      identifier,
      recipientEmail,
      recipientName: user.name,
    });

    return NextResponse.json({
      success: true,
      message: purpose === "email-change" ? "A verification code has been sent to your new email." : "A new verification code has been generated.",
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
