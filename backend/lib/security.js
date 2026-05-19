import crypto from "node:crypto";
import runtimeEnv from "../config/runtime-env.cjs";
import { getCurrentRequest } from "./request-context.js";

const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getRawEncryptionSecret() {
  const key = String(process.env.AUTH_PROVIDER_SECRET_ENCRYPTION_KEY || "").trim();
  if (!key) {
    throw new Error("AUTH_PROVIDER_SECRET_ENCRYPTION_KEY is not configured");
  }

  return key;
}

function deriveEncryptionKey() {
  return crypto.createHash("sha256").update(getRawEncryptionSecret()).digest();
}

export function encryptSecret(value) {
  if (!value) {
    return null;
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, deriveEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export function decryptSecret(value) {
  if (!value) {
    return "";
  }

  const payload = Buffer.from(String(value), "base64");
  const iv = payload.subarray(0, IV_LENGTH);
  const authTag = payload.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = payload.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, deriveEncryptionKey(), iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

export function maskSecret(value) {
  if (!value) {
    return "";
  }

  const normalized = String(value);
  const visibleTail = normalized.slice(-4);
  return `${"*".repeat(Math.max(8, normalized.length - visibleTail.length))}${visibleTail}`;
}

export function isMaskedSecret(value) {
  return typeof value === "string" && /^\*{4,}/.test(value);
}

export function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidRedirectValue(value) {
  if (!value) {
    return false;
  }

  return value.startsWith("/") || isValidHttpUrl(value);
}

function normalizeOrigin(value) {
  return String(value || "").trim().replace(/\/$/, "");
}

export function resolveSafeRedirect(value, fallback = runtimeEnv.getServerConfig().frontendUrl) {
  const fallbackTarget = normalizeOrigin(fallback) || "http://localhost:3001";
  const candidate = String(value || "").trim();

  if (!candidate) {
    return fallbackTarget;
  }

  if (candidate.startsWith("/")) {
    return `${fallbackTarget}${candidate}`;
  }

  if (!isValidHttpUrl(candidate)) {
    return fallbackTarget;
  }

  const allowedOrigins = new Set([
    normalizeOrigin(runtimeEnv.getServerConfig().frontendUrl),
    normalizeOrigin(runtimeEnv.getServerConfig().appUrl),
    ...runtimeEnv.getServerConfig().allowedOrigins.map(normalizeOrigin),
  ]);
  const origin = normalizeOrigin(new URL(candidate).origin);

  return allowedOrigins.has(origin) ? candidate : fallbackTarget;
}

export function getRequestIp(request = getCurrentRequest()) {
  if (!request) {
    return "";
  }

  const forwarded = String(request.headers.get("x-forwarded-for") || "")
    .split(",")[0]
    .trim();

  return forwarded || String(request.headers.get("x-real-ip") || "").trim() || "";
}

export function getDeviceTypeFromUserAgent(userAgent = "") {
  const normalized = String(userAgent || "").toLowerCase();

  if (!normalized) {
    return "unknown";
  }

  if (/(bot|crawl|spider|slurp|mediapartners)/i.test(normalized)) {
    return "bot";
  }

  if (/(ipad|tablet|playbook|silk)|(android(?!.*mobile))/i.test(normalized)) {
    return "tablet";
  }

  if (/(mobi|iphone|ipod|android.*mobile|windows phone|opera mini)/i.test(normalized)) {
    return "mobile";
  }

  return "desktop";
}

export function assertTrustedOrigin(request = getCurrentRequest()) {
  if (!request) {
    return;
  }

  const origin = normalizeOrigin(request.headers.get("origin") || request.headers.get("referer") || "");
  if (!origin) {
    return;
  }

  const allowedOrigins = new Set([
    normalizeOrigin(runtimeEnv.getServerConfig().frontendUrl),
    normalizeOrigin(runtimeEnv.getServerConfig().appUrl),
    ...runtimeEnv.getServerConfig().allowedOrigins.map(normalizeOrigin),
  ]);

  let candidateOrigin = origin;
  if (origin.includes("://") && origin.includes("/", origin.indexOf("://") + 3)) {
    candidateOrigin = normalizeOrigin(new URL(origin).origin);
  }

  if (!allowedOrigins.has(candidateOrigin)) {
    throw new Error("FORBIDDEN_ORIGIN");
  }
}

export function createSignedToken(payload, expiresInSeconds = 600) {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const encodedPayload = Buffer.from(JSON.stringify({ ...payload, exp: expiresAt })).toString("base64url");
  const signature = crypto.createHmac("sha256", getRawEncryptionSecret()).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function verifySignedToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".", 2);
  const expectedSignature = crypto.createHmac("sha256", getRawEncryptionSecret()).update(encodedPayload).digest("base64url");
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (!payload?.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
