import jwt from "jsonwebtoken";
import runtimeEnv from "../config/runtime-env.cjs";
import { getCurrentRequest } from "./request-context.js";

export const SESSION_COOKIE_NAME = "finance_tracker_session";

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

export function getSessionSecret() {
  return process.env.AUTH_SECRET || runtimeEnv.DEFAULT_AUTH_SECRET;
}

export function getSessionCookieValue(request = getCurrentRequest()) {
  if (!request) {
    return null;
  }

  const cookies = parseCookies(request.headers.get("cookie"));
  return cookies[SESSION_COOKIE_NAME] || null;
}

export function verifySessionToken(token) {
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, getSessionSecret());
  } catch {
    return null;
  }
}

export function getSessionPayload(request = getCurrentRequest()) {
  return verifySessionToken(getSessionCookieValue(request));
}

export function createSessionToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email || "",
      role: user.role || "user",
    },
    getSessionSecret(),
    { expiresIn: "7d" },
  );
}

export function buildSessionCookie(token, options = {}) {
  const serverConfig = runtimeEnv.getServerConfig();
  const maxAge = options.clear ? 0 : 60 * 60 * 24 * 7;
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token || "")}`,
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

export function appendCookieHeader(headers, cookieValue) {
  headers.append("Set-Cookie", cookieValue);
  return headers;
}
