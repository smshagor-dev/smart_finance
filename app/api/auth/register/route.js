import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { getSiteSettings } from "@/lib/site-settings";
import { ensureUserFinanceSetup } from "@/lib/user";
import { registerSchema } from "@/lib/validators";
import { issueVerificationCode } from "@/lib/verification";
import { createErrorResponse } from "@/lib/http-error";

export async function POST(request) {
  try {
    const payload = registerSchema.parse(await request.json());
    const exists = await prisma.user.findUnique({ where: { email: payload.email } });
    if (exists) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
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
        emailVerified: siteSettings.requireEmailVerification ? null : new Date(),
        defaultCurrencyId: payload.defaultCurrencyId || (await prisma.currency.findUnique({ where: { code: "USD" } }))?.id || null,
      },
    });

    await ensureUserFinanceSetup(user.id, user.defaultCurrencyId);
    if (siteSettings.requireEmailVerification) {
      await issueVerificationCode({
        identifier: payload.email.toLowerCase(),
        recipientEmail: payload.email,
        recipientName: payload.name,
      });
    }

    return NextResponse.json({
      success: true,
      requiresVerification: siteSettings.requireEmailVerification,
      email: payload.email,
      message: siteSettings.requireEmailVerification
        ? "Registration complete. Verify your email with the 6-digit code."
        : "Registration complete. Your account is ready to use.",
    });
  } catch (error) {
    return createErrorResponse("POST /api/auth/register", error, {
      publicMessage:
        error.name === "ZodError"
          ? error.message
          : "Registration failed. Please check your email settings and try again.",
    });
  }
}
