import { loginSchema } from "../../../../lib/validators/index.js";
import { prisma } from "../../../../lib/prisma.js";
import { verifyPassword } from "../../../../lib/password.js";
import { getSiteSettings } from "../../../../lib/site-settings.js";
import { createAuditLog } from "../../../../lib/audit.js";
import { assertTrustedOrigin, getDeviceTypeFromUserAgent } from "../../../../lib/security.js";
import { createAuthenticatedResponse, markUserLoggedIn } from "../../../../lib/auth-session.js";

export async function POST(request) {
  try {
    assertTrustedOrigin(request);
    const payload = loginSchema.parse(await request.json());
    const siteSettings = await getSiteSettings();
    const user = await prisma.user.findFirst({
      where: { email: payload.email },
      include: { defaultCurrency: true },
    });

    if (!user?.password) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(payload.password, user.password);
    if (!valid) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (siteSettings.requireEmailVerification && !user.emailVerified) {
      return Response.json({ error: "Please verify your email before logging in" }, { status: 403 });
    }

    const loggedInUser = await markUserLoggedIn(user.id, "email");
    await createAuditLog({
      actorUserId: loggedInUser.id,
      action: "auth.login",
      entityType: "user",
      entityId: loggedInUser.id,
      description: "Email login successful",
      meta: {
        provider: "email",
        deviceType: getDeviceTypeFromUserAgent(request.headers.get("user-agent")),
      },
      request,
    });
    return createAuthenticatedResponse(loggedInUser);
  } catch (error) {
    return Response.json(
      { error: error.name === "ZodError" ? error.message : error.message || "Login failed" },
      { status: error.message === "FORBIDDEN_ORIGIN" ? 403 : error.name === "ZodError" ? 400 : 500 },
    );
  }
}
