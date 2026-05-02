import { addMinutes } from "date-fns";
import { buildVerificationEmail } from "@/lib/email-templates";
import { sendMail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";

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

  await sendMail({
    to: recipientEmail,
    subject: verificationEmail.subject,
    html: verificationEmail.html,
    text: verificationEmail.text,
  });
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
