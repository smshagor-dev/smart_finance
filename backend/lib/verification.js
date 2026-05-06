import { addMinutes } from "date-fns";
import runtimeEnv from "../config/runtime-env.cjs";
import { buildVerificationEmail } from "./email-templates.js";
import { sendMail } from "./mailer.js";
import { prisma } from "./prisma.js";
import { getSiteSettings } from "./site-settings.js";

function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function createUniqueVerificationCode() {
  for (let index = 0; index < 10; index += 1) {
    const code = generateVerificationCode();
    const exists = await prisma.verificationToken.findUnique({
      where: { token: code },
    });
    if (!exists) {
      return code;
    }
  }

  throw new Error("Could not generate a unique verification code");
}

export function buildEmailChangeIdentifier(userId, newEmail) {
  return `email-change:${userId}:${newEmail.toLowerCase()}`;
}

export async function issueVerificationCode({ identifier, recipientEmail, recipientName }) {
  const siteSettings = await getSiteSettings();
  const expiryMinutes = Math.max(5, Number(siteSettings.verificationCodeExpiryMinutes || 15));
  const code = await createUniqueVerificationCode();
  const shouldAttemptDelivery = runtimeEnv.isProduction() || process.env.SMTP_FORCE_DELIVERY === "true";
  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });
  await prisma.verificationToken.create({
    data: {
      identifier,
      token: code,
      expires: addMinutes(new Date(), expiryMinutes),
    },
  });

  const verificationEmail = buildVerificationEmail({
    name: recipientName,
    code,
    expiryMinutes,
    siteSettings,
  });

  if (!shouldAttemptDelivery) {
    return {
      code,
      sent: false,
      expiryMinutes,
      skipped: true,
    };
  }

  try {
    await sendMail({
      to: recipientEmail,
      subject: verificationEmail.subject,
      html: verificationEmail.html,
      text: verificationEmail.text,
    });
    return {
      code,
      sent: true,
      expiryMinutes,
    };
  } catch (error) {
    if (runtimeEnv.isProduction()) {
      throw error;
    }

    console.warn(`[verification] Email delivery skipped in non-production: ${error.message}`);
    return {
      code,
      sent: false,
      expiryMinutes,
      error: error.message,
    };
  }
}

export async function getPendingEmailChange(userId) {
  const token = await prisma.verificationToken.findFirst({
    where: {
      identifier: {
        startsWith: `email-change:${userId}:`,
      },
      expires: {
        gt: new Date(),
      },
    },
    orderBy: { expires: "desc" },
  });

  if (!token) return null;
  return token.identifier.split(":").slice(2).join(":") || null;
}
