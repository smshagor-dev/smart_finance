import crypto from "node:crypto";
import runtimeEnv from "../config/runtime-env.cjs";
import { createAuditLog } from "./audit.js";
import { getAuthProviderSetting, isProviderAvailable } from "./auth-provider-settings.js";
import { buildAuthResponsePayload, createAuthenticatedResponse, markUserLoggedIn } from "./auth-session.js";
import { prisma } from "./prisma.js";
import { assertTrustedOrigin, createSignedToken, getDeviceTypeFromUserAgent, resolveSafeRedirect, verifySignedToken } from "./security.js";
import { buildSessionCookie, appendCookieHeader } from "./session.js";

const OAUTH_STATE_COOKIE = "finance_tracker_oauth_state";

function parseCookies(cookieHeader) {
  return Object.fromEntries(
    String(cookieHeader || "")
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separatorIndex = part.indexOf("=");
        if (separatorIndex === -1) {
          return [part, ""];
        }

        return [part.slice(0, separatorIndex), decodeURIComponent(part.slice(separatorIndex + 1))];
      }),
  );
}

function buildOAuthStateCookie(token, clear = false) {
  const serverConfig = runtimeEnv.getServerConfig();
  const maxAge = clear ? 0 : 60 * 10;
  const parts = [
    `${OAUTH_STATE_COOKIE}=${encodeURIComponent(token || "")}`,
    "Path=/",
    "HttpOnly",
    `SameSite=${serverConfig.sessionCookieSameSite}`,
    `Max-Age=${maxAge}`,
  ];

  if (serverConfig.sessionCookieDomain) {
    parts.push(`Domain=${serverConfig.sessionCookieDomain}`);
  }

  if (serverConfig.sessionCookieSecure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function mergeProviderMeta(existingMeta, provider, nextMeta) {
  return {
    ...(existingMeta && typeof existingMeta === "object" ? existingMeta : {}),
    [provider]: {
      ...(((existingMeta && typeof existingMeta === "object" ? existingMeta[provider] : null) || {})),
      ...(nextMeta || {}),
    },
  };
}

export function createProviderState(provider, returnTo = "/dashboard") {
  return createSignedToken({
    provider,
    nonce: crypto.randomUUID(),
    returnTo,
  });
}

export function consumeProviderState(request, provider, state) {
  const cookies = parseCookies(request.headers.get("cookie"));
  const cookieValue = cookies[OAUTH_STATE_COOKIE] || "";
  const token = String(state || "");

  if (!cookieValue || !token || cookieValue !== token) {
    return null;
  }

  const payload = verifySignedToken(token);
  if (!payload || payload.provider !== provider) {
    return null;
  }

  return payload;
}

function buildRedirectUrl(baseUrl, params) {
  const url = new URL(resolveSafeRedirect(baseUrl));

  for (const [key, value] of Object.entries(params || {})) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

export function buildProviderFailureRedirect(setting, code, message, returnTo) {
  return buildRedirectUrl(setting?.failureRedirectUrl || returnTo || "/login", {
    authError: code,
    message,
  });
}

export function buildProviderSuccessRedirect(setting, returnTo, payload) {
  return buildRedirectUrl(returnTo || setting?.successRedirectUrl || "/dashboard", payload);
}

async function fetchJson(url, init = {}, fallbackMessage = "Provider request failed") {
  const response = await fetch(url, init);
  const text = await response.text();
  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!response.ok) {
    throw new Error(data.error_description || data.error?.message || data.error || fallbackMessage);
  }

  return data;
}

export async function getEnabledAuthProvider(provider) {
  const setting = await getAuthProviderSetting(provider);

  if (!setting || !isProviderAvailable(setting)) {
    throw new Error("Provider is disabled or incomplete");
  }

  return setting;
}

export async function getTelegramBotProfile(setting) {
  if (!setting?.botToken) {
    throw new Error("Telegram bot token is required");
  }

  const data = await fetchJson(`https://api.telegram.org/bot${encodeURIComponent(setting.botToken)}/getMe`, {}, "Telegram bot validation failed");
  if (!data?.ok || !data?.result) {
    throw new Error("Telegram bot validation failed");
  }

  return data.result;
}

async function upsertAccountLink(userId, provider, providerAccountId, scope = "") {
  const existing = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider,
        providerAccountId,
      },
    },
  });

  if (existing) {
    if (existing.userId !== userId) {
      throw new Error("This provider is already linked to another account");
    }

    return prisma.account.update({
      where: { id: existing.id },
      data: {
        scope: scope || existing.scope || null,
        type: "oauth",
      },
    });
  }

  return prisma.account.create({
    data: {
      userId,
      type: "oauth",
      provider,
      providerAccountId,
      scope: scope || null,
    },
  });
}

export async function findOrCreateSocialUser({
  provider,
  providerId,
  email,
  name,
  avatar,
  emailVerified = false,
  scope = "",
  providerMeta = {},
}) {
  const providerField = `${provider}Id`;
  const normalizedEmail = email ? String(email).trim().toLowerCase() : null;

  const existingByProvider = await prisma.user.findFirst({
    where: { [providerField]: providerId },
    include: { defaultCurrency: true },
  });

  if (existingByProvider) {
    const updated = await prisma.user.update({
      where: { id: existingByProvider.id },
      data: {
        name: existingByProvider.name || name || null,
        avatar: avatar || existingByProvider.avatar || existingByProvider.image || null,
        image: avatar || existingByProvider.image || existingByProvider.avatar || null,
        email: existingByProvider.email || normalizedEmail,
        emailVerified: existingByProvider.emailVerified || (emailVerified && normalizedEmail ? new Date() : null),
        providerMeta: mergeProviderMeta(existingByProvider.providerMeta, provider, providerMeta),
      },
      include: { defaultCurrency: true },
    });

    await upsertAccountLink(updated.id, provider, providerId, scope);
    return updated;
  }

  const existingByEmail = normalizedEmail
    ? await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { defaultCurrency: true },
      })
    : null;

  if (existingByEmail) {
    if (existingByEmail[providerField] && existingByEmail[providerField] !== providerId) {
      throw new Error("This email is already linked to another provider account");
    }

    const updated = await prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        [providerField]: providerId,
        avatar: existingByEmail.avatar || existingByEmail.image || avatar || null,
        image: existingByEmail.image || existingByEmail.avatar || avatar || null,
        emailVerified: existingByEmail.emailVerified || (emailVerified ? new Date() : null),
        providerMeta: mergeProviderMeta(existingByEmail.providerMeta, provider, providerMeta),
      },
      include: { defaultCurrency: true },
    });

    await upsertAccountLink(updated.id, provider, providerId, scope);
    return updated;
  }

  const isFirstUser = (await prisma.user.count()) === 0;
  const created = await prisma.user.create({
    data: {
      name: name || normalizedEmail || provider,
      email: normalizedEmail,
      role: isFirstUser ? "admin" : "user",
      registrationProvider: provider,
      [providerField]: providerId,
      avatar: avatar || null,
      image: avatar || null,
      emailVerified: normalizedEmail && emailVerified ? new Date() : null,
      providerMeta: mergeProviderMeta(null, provider, providerMeta),
    },
    include: { defaultCurrency: true },
  });

  await upsertAccountLink(created.id, provider, providerId, scope);
  return created;
}

export async function finalizeProviderLogin({ provider, user, request, successRedirectUrl, returnTo }) {
  const loggedInUser = await markUserLoggedIn(user.id, provider);
  const authResponse = createAuthenticatedResponse(loggedInUser);
  const redirectUrl = buildProviderSuccessRedirect({ successRedirectUrl }, returnTo || successRedirectUrl, {
    authSuccess: "1",
    provider,
    onboardingRequired: buildAuthResponsePayload(loggedInUser).onboardingRequired ? "1" : "0",
  });

  const headers = new Headers(authResponse.headers);
  appendCookieHeader(headers, buildOAuthStateCookie("", true));
  headers.set("Location", redirectUrl);

  await createAuditLog({
    actorUserId: loggedInUser.id,
    action: "auth.login",
    entityType: "user",
    entityId: loggedInUser.id,
    description: `${provider} login successful`,
    meta: {
      provider,
      deviceType: getDeviceTypeFromUserAgent(request.headers.get("user-agent")),
      returnTo: returnTo || null,
      userAgent: request.headers.get("user-agent") || "",
    },
    request,
  });

  return new Response(null, {
    status: 302,
    headers,
  });
}

export async function buildGoogleAuthorizationUrl(setting, state) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", setting.clientId);
  url.searchParams.set("redirect_uri", setting.callbackUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", setting.scopes || "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

export async function exchangeGoogleCode(setting, code) {
  const tokenData = await fetchJson(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: setting.clientId,
        client_secret: setting.clientSecret,
        redirect_uri: setting.callbackUrl,
        grant_type: "authorization_code",
      }),
    },
    "Google token exchange failed",
  );

  const profile = await fetchJson(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    },
    "Google profile request failed",
  );

  return {
    providerId: profile.sub,
    email: profile.email || null,
    name: profile.name || `${profile.given_name || ""} ${profile.family_name || ""}`.trim(),
    avatar: profile.picture || null,
    emailVerified: Boolean(profile.email_verified),
    scope: tokenData.scope || setting.scopes || "",
    providerMeta: {
      givenName: profile.given_name || "",
      familyName: profile.family_name || "",
      locale: profile.locale || "",
    },
  };
}

export function buildFacebookAuthorizationUrl(setting, state) {
  const url = new URL("https://www.facebook.com/v19.0/dialog/oauth");
  url.searchParams.set("client_id", setting.clientId);
  url.searchParams.set("redirect_uri", setting.callbackUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", setting.scopes || "email,public_profile");
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeFacebookCode(setting, code) {
  const tokenData = await fetchJson(
    `https://graph.facebook.com/v19.0/oauth/access_token?${new URLSearchParams({
      client_id: setting.clientId,
      client_secret: setting.clientSecret,
      redirect_uri: setting.callbackUrl,
      code,
    }).toString()}`,
    {},
    "Facebook token exchange failed",
  );

  const profile = await fetchJson(
    `https://graph.facebook.com/me?${new URLSearchParams({
      fields: "id,name,email,first_name,last_name,picture.type(large)",
      access_token: tokenData.access_token,
    }).toString()}`,
    {},
    "Facebook profile request failed",
  );

  return {
    providerId: profile.id,
    email: profile.email || null,
    name: profile.name || `${profile.first_name || ""} ${profile.last_name || ""}`.trim(),
    avatar: profile.picture?.data?.url || null,
    emailVerified: Boolean(profile.email),
    scope: tokenData.scope || setting.scopes || "",
    providerMeta: {
      firstName: profile.first_name || "",
      lastName: profile.last_name || "",
    },
  };
}

export function buildTelegramWidgetHtml({ botUsername, callbackUrl, state, siteName, failureRedirectUrl }) {
  const authUrl = new URL(callbackUrl);
  authUrl.searchParams.set("state", state);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Continue with Telegram</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: linear-gradient(160deg, #108A45 0%, #0F7A3A 52%, #075C2B 100%); font-family: Segoe UI, Arial, sans-serif; color: #fff; }
      .card { width: min(92vw, 420px); border-radius: 28px; background: rgba(255,255,255,.12); backdrop-filter: blur(18px); padding: 28px; box-shadow: 0 24px 60px rgba(0,0,0,.18); }
      h1 { margin: 0 0 8px; font-size: 28px; }
      p { margin: 0 0 24px; line-height: 1.6; color: rgba(255,255,255,.82); }
      .actions { margin-top: 20px; }
      a { color: #fff; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Continue with Telegram</h1>
      <p>Authenticate securely to ${siteName} with your Telegram account.</p>
      <script async src="https://telegram.org/js/telegram-widget.js?22" data-telegram-login="${botUsername}" data-size="large" data-auth-url="${authUrl.toString()}" data-request-access="write"></script>
      <div class="actions">
        <a href="${resolveSafeRedirect(failureRedirectUrl || "/login")}">Back to login</a>
      </div>
    </div>
  </body>
</html>`;
}

export function verifyTelegramAuthPayload(payload, botToken) {
  const hash = String(payload.hash || "");
  const entries = Object.entries(payload)
    .filter(([key, value]) => key !== "hash" && key !== "state" && value !== undefined && value !== null && value !== "")
    .sort(([left], [right]) => left.localeCompare(right));
  const dataCheckString = entries.map(([key, value]) => `${key}=${value}`).join("\n");
  const secret = crypto.createHash("sha256").update(botToken).digest();
  const expectedHash = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");

  if (!hash || hash.length !== expectedHash.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash));
}

export function getTelegramProfileFromQuery(searchParams) {
  return {
    providerId: String(searchParams.get("id") || ""),
    email: null,
    name: [searchParams.get("first_name"), searchParams.get("last_name")].filter(Boolean).join(" ").trim() || searchParams.get("username") || "Telegram User",
    avatar: searchParams.get("photo_url") || null,
    emailVerified: false,
    scope: "",
    providerMeta: {
      username: searchParams.get("username") || "",
      firstName: searchParams.get("first_name") || "",
      lastName: searchParams.get("last_name") || "",
      authDate: searchParams.get("auth_date") || "",
    },
  };
}

export async function buildProviderConnectionTest(provider, setting) {
  assertTrustedOrigin();

  if (provider === "telegram") {
    const bot = await getTelegramBotProfile(setting);
    return {
      success: true,
      message: `Connected to Telegram bot @${bot.username}`,
      meta: {
        botId: bot.id,
        username: bot.username,
      },
    };
  }

  if (provider === "facebook") {
    const tokenData = await fetchJson(
      `https://graph.facebook.com/oauth/access_token?${new URLSearchParams({
        client_id: setting.clientId,
        client_secret: setting.clientSecret,
        grant_type: "client_credentials",
      }).toString()}`,
      {},
      "Facebook app validation failed",
    );

    return {
      success: true,
      message: "Facebook app credentials are valid",
      meta: {
        scope: setting.scopes || "",
        tokenType: tokenData.token_type || "",
      },
    };
  }

  await fetchJson("https://accounts.google.com/.well-known/openid-configuration", {}, "Google provider metadata could not be loaded");
  return {
    success: true,
    message: "Google provider metadata loaded successfully",
    meta: {
      scope: setting.scopes || "",
    },
  };
}

export { buildOAuthStateCookie };
