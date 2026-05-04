import crypto from "crypto";
import { addHours } from "date-fns";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validators";
import { createErrorResponse } from "@/lib/http-error";

export async function POST(request) {
  try {
    const payload = forgotPasswordSchema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { email: payload.email } });

    if (user?.email) {
      await prisma.verificationToken.create({
        data: {
          identifier: user.email,
          token: crypto.randomUUID(),
          expires: addHours(new Date(), 1),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "If the email exists, a reset token has been prepared for future email delivery.",
    });
  } catch (error) {
    return createErrorResponse("POST /api/auth/forgot-password", error);
  }
}
