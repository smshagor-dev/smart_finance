import { loginSchema } from "../../../../lib/validators/index.js";
import { prisma } from "../../../../lib/prisma.js";
import { verifyPassword } from "../../../../lib/password.js";
import { getSiteSettings } from "../../../../lib/site-settings.js";
import { createSessionToken, appendCookieHeader, buildSessionCookie } from "../../../../lib/session.js";

export async function POST(request) {
  try {
    const payload = loginSchema.parse(await request.json());
    const siteSettings = await getSiteSettings();
    const user = await prisma.user.findUnique({
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

    const headers = new Headers();
    appendCookieHeader(headers, buildSessionCookie(createSessionToken(user)));

    return Response.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          defaultCurrencyId: user.defaultCurrencyId,
          defaultCurrencyCode: user.defaultCurrency?.code || "USD",
          emailVerified: user.emailVerified,
        },
      },
      { headers },
    );
  } catch (error) {
    return Response.json(
      { error: error.name === "ZodError" ? error.message : error.message || "Login failed" },
      { status: error.name === "ZodError" ? 400 : 500 },
    );
  }
}
