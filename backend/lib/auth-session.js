import { prisma } from "./prisma.js";
import { appendCookieHeader, buildSessionCookie, createSessionToken } from "./session.js";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

export function buildOnboardingState(user) {
  const emailRequired = !user?.email;
  const defaultCurrencyRequired = !user?.defaultCurrencyId;

  return {
    required: emailRequired || defaultCurrencyRequired,
    emailRequired,
    defaultCurrencyRequired,
  };
}

export function buildAuthUser(user) {
  const onboarding = buildOnboardingState(user);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.avatar || user.image,
    avatar: user.avatar || user.image,
    role: user.role,
    defaultCurrencyId: user.defaultCurrencyId,
    defaultCurrencyCode: user.defaultCurrency?.code || "USD",
    emailVerified: user.emailVerified,
    registrationProvider: user.registrationProvider,
    lastLoginProvider: user.lastLoginProvider,
    lastLoginAt: user.lastLoginAt,
    authProviders: {
      email: Boolean(user.password),
      google: Boolean(user.googleId),
      facebook: Boolean(user.facebookId),
      telegram: Boolean(user.telegramId),
    },
    onboarding,
  };
}

export async function markUserLoggedIn(userId, provider) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      lastLoginProvider: provider,
      lastLoginAt: new Date(),
      loginCount: {
        increment: 1,
      },
    },
    include: {
      defaultCurrency: true,
    },
  });
}

export function buildAuthResponsePayload(user) {
  const onboarding = buildOnboardingState(user);

  return {
    success: true,
    user: buildAuthUser(user),
    accessToken: null,
    refreshToken: null,
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
    onboardingRequired: onboarding.required,
    onboarding,
  };
}

export function createAuthenticatedResponse(user) {
  const headers = new Headers();
  appendCookieHeader(headers, buildSessionCookie(createSessionToken(user)));

  return Response.json(buildAuthResponsePayload(user), { headers });
}
