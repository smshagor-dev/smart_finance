import { prisma } from "../../../../lib/prisma.js";
import { publishLiveEvent } from "../../../../lib/live-events.js";
import { verifyEmailSchema } from "../../../../lib/validators/index.js";
import { buildEmailChangeIdentifier } from "../../../../lib/verification.js";

export async function POST(request) {
  try {
    const payload = verifyEmailSchema.parse(await request.json());

    const directIdentifier = payload.email.toLowerCase();
    const verification = await prisma.verificationToken.findFirst({
      where: { token: payload.code },
    });

    const isStandardVerification = verification?.identifier === directIdentifier;
    const isEmailChangeVerification =
      verification?.identifier?.startsWith("email-change:") && verification.identifier.endsWith(`:${payload.email.toLowerCase()}`);

    if (!verification || verification.expires < new Date() || (!isStandardVerification && !isEmailChangeVerification)) {
      return Response.json({ error: "Verification code is invalid or expired" }, { status: 400 });
    }

    if (isEmailChangeVerification) {
      const [, userId, pendingEmail] = verification.identifier.split(":");
      if (pendingEmail?.toLowerCase() !== payload.email.toLowerCase()) {
        return Response.json({ error: "Verification code is invalid or expired" }, { status: 400 });
      }

      const emailInUse = await prisma.user.findFirst({
        where: {
          email: payload.email,
          NOT: { id: userId },
        },
      });
      if (emailInUse) {
        return Response.json({ error: "Email is already in use" }, { status: 409 });
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          email: payload.email,
          emailVerified: new Date(),
        },
      });

      await prisma.verificationToken.deleteMany({
        where: {
          OR: [
            { identifier: verification.identifier },
            { identifier: buildEmailChangeIdentifier(userId, payload.email) },
          ],
        },
      });

      publishLiveEvent({ userId, resource: "profile", action: "verified", extraResources: ["settings"] });
    } else {
      await prisma.user.updateMany({
        where: { email: payload.email },
        data: { emailVerified: new Date() },
      });

      await prisma.verificationToken.deleteMany({
        where: { identifier: payload.email.toLowerCase() },
      });
    }

    return Response.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: error.name === "ZodError" ? 400 : 500 });
  }
}
