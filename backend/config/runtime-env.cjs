const fs = require("fs");
const path = require("path");

function detectRoots() {
  const appRootCandidate = path.resolve(__dirname, "..");
  const monorepoRootCandidate = path.resolve(__dirname, "..", "..");
  const backendPackagePath = path.join(appRootCandidate, "package.json");
  const backendServerPath = path.join(appRootCandidate, "server.js");
  const monorepoBackendPackagePath = path.join(monorepoRootCandidate, "backend", "package.json");

  const isBackendOnlyLayout =
    fs.existsSync(backendPackagePath) &&
    fs.existsSync(backendServerPath) &&
    !fs.existsSync(monorepoBackendPackagePath);

  if (isBackendOnlyLayout) {
    return {
      projectRoot: appRootCandidate,
      backendRoot: appRootCandidate,
      frontendRoot: path.join(appRootCandidate, "frontend"),
    };
  }

  return {
    projectRoot: monorepoRootCandidate,
    backendRoot: path.join(monorepoRootCandidate, "backend"),
    frontendRoot: path.join(monorepoRootCandidate, "frontend"),
  };
}

const { projectRoot, backendRoot, frontendRoot } = detectRoots();
const DEFAULT_AUTH_SECRET = "change-this-secret";
const VALID_SAME_SITE_VALUES = new Set(["Lax", "Strict", "None"]);

function stripWrappingQuotes(value) {
  if (!value) {
    return value;
  }

  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  return value;
}

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = stripWrappingQuotes(line.slice(separatorIndex + 1).trim());

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function getScopedEnvCandidates(scope) {
  if (scope === "frontend") {
    return [
      path.join(frontendRoot, ".env.local"),
      path.join(frontendRoot, ".env"),
    ];
  }

  if (scope === "backend") {
    return [
      path.join(backendRoot, ".env.local"),
      path.join(backendRoot, ".env"),
    ];
  }

  const cwd = process.cwd();
  return [
    path.join(cwd, ".env.local"),
    path.join(cwd, ".env"),
    path.join(projectRoot, ".env.local"),
    path.join(projectRoot, ".env"),
  ];
}

function loadEnvFiles(scope) {
  const candidates = getScopedEnvCandidates(scope);

  for (const candidate of candidates) {
    loadEnvFile(candidate);
  }
}

function encodeSegment(value) {
  return encodeURIComponent(value || "");
}

function buildDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const protocol = process.env.DB_PROTOCOL || "mysql";
  const host = process.env.DB_HOST || "127.0.0.1";
  const port = process.env.DB_PORT || "3306";
  const dbName = process.env.DB_NAME || "finance_tracker";
  const username = process.env.DB_USER || "";
  const password = process.env.DB_PASSWORD || "";
  const auth = username ? `${encodeSegment(username)}:${encodeSegment(password)}@` : "";

  return `${protocol}://${auth}${host}:${port}/${dbName}`;
}

function getEnvNumber(name, fallback) {
  const rawValue = process.env[name];
  if (rawValue === undefined || rawValue === "") {
    return fallback;
  }

  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getEnvBoolean(name, fallback = false) {
  const rawValue = process.env[name];
  if (rawValue === undefined || rawValue === "") {
    return fallback;
  }

  return String(rawValue).toLowerCase() === "true";
}

function splitCsv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeOrigin(value) {
  return String(value || "").trim().replace(/\/$/, "");
}

function normalizeListenHost(value, fallback = "0.0.0.0") {
  const host = String(value || fallback).trim();
  return host.toLowerCase() === "localhost" ? "127.0.0.1" : host || fallback;
}

function getAllowedOrigins() {
  const configuredOrigins = splitCsv(process.env.CORS_ORIGIN);
  const defaultOrigin = normalizeOrigin(process.env.FRONTEND_URL || "http://localhost:3001");
  const values = configuredOrigins.length ? configuredOrigins : [defaultOrigin];

  return [...new Set(values.map(normalizeOrigin).filter(Boolean))];
}

function getServerConfig() {
  return {
    isProduction: isProduction(),
    host: normalizeListenHost(process.env.BACKEND_HOST, "0.0.0.0"),
    port: getEnvNumber("BACKEND_PORT", 4000),
    frontendUrl: normalizeOrigin(process.env.FRONTEND_URL || "http://localhost:3001"),
    appUrl: normalizeOrigin(process.env.APP_URL || "http://localhost:3001"),
    allowedOrigins: getAllowedOrigins(),
    requestSizeLimitBytes: getEnvNumber("MAX_REQUEST_SIZE_MB", 12) * 1024 * 1024,
    requestTimeoutMs: getEnvNumber("REQUEST_TIMEOUT_MS", 30000),
    keepAliveTimeoutMs: getEnvNumber("KEEP_ALIVE_TIMEOUT_MS", 5000),
    headersTimeoutMs: getEnvNumber("HEADERS_TIMEOUT_MS", 60000),
    rateLimitWindowMs: getEnvNumber("RATE_LIMIT_WINDOW_MS", 60000),
    rateLimitMaxRequests: getEnvNumber("RATE_LIMIT_MAX_REQUESTS", 300),
    authRateLimitMaxRequests: getEnvNumber("AUTH_RATE_LIMIT_MAX_REQUESTS", 10),
    trustProxy: getEnvBoolean("TRUST_PROXY", true),
    sessionCookieDomain: process.env.SESSION_COOKIE_DOMAIN || "",
    sessionCookieSameSite: process.env.SESSION_COOKIE_SAME_SITE || "Lax",
    sessionCookieSecure: getEnvBoolean("SESSION_COOKIE_SECURE", isProduction()),
  };
}

function validateAbsoluteUrl(name, value) {
  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol)) {
      throw new Error(`${name} must use http or https`);
    }
  } catch (error) {
    throw new Error(`${name} must be a valid absolute URL`);
  }
}

function validateProductionUrl(name, value) {
  validateAbsoluteUrl(name, value);
  const url = new URL(value);
  const hostname = url.hostname.toLowerCase();

  if (url.protocol !== "https:") {
    throw new Error(`${name} must use https in production`);
  }

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    throw new Error(`${name} cannot use a localhost address in production`);
  }
}

function validateDatabaseEnv() {
  const requiredDatabaseVars = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER"];
  for (const name of requiredDatabaseVars) {
    if (!String(process.env[name] || "").trim()) {
      throw new Error(`${name} must be set`);
    }
  }
}

function validateSessionEnv() {
  const sameSite = String(process.env.SESSION_COOKIE_SAME_SITE || "Lax");
  if (!VALID_SAME_SITE_VALUES.has(sameSite)) {
    throw new Error("SESSION_COOKIE_SAME_SITE must be one of Lax, Strict, or None");
  }

  const secure = getEnvBoolean("SESSION_COOKIE_SECURE", isProduction());
  if (sameSite === "None" && !secure) {
    throw new Error("SESSION_COOKIE_SECURE must be true when SESSION_COOKIE_SAME_SITE=None");
  }
}

function validateProductionEnv() {
  if (!isProduction()) {
    return;
  }

  const authSecret = process.env.AUTH_SECRET || "";
  if (!authSecret || authSecret === DEFAULT_AUTH_SECRET || authSecret.length < 32) {
    throw new Error("AUTH_SECRET must be set to a strong unique value in production");
  }

  validateDatabaseEnv();
  validateSessionEnv();
  validateProductionUrl("FRONTEND_URL", process.env.FRONTEND_URL || "");
  validateProductionUrl("APP_URL", process.env.APP_URL || "");

  const allowedOrigins = getAllowedOrigins();
  if (!allowedOrigins.length) {
    throw new Error("CORS_ORIGIN or FRONTEND_URL must define at least one allowed origin in production");
  }

  for (const origin of allowedOrigins) {
    validateProductionUrl("CORS_ORIGIN", origin);
  }
}

function validateFrontendEnv() {
  const appUrl = process.env.APP_URL || "";
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const internalApiBaseUrl = process.env.INTERNAL_API_BASE_URL || "";

  if (!appUrl) {
    throw new Error("APP_URL must be set");
  }

  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL must be set");
  }

  validateAbsoluteUrl("APP_URL", appUrl);
  validateAbsoluteUrl("NEXT_PUBLIC_API_BASE_URL", apiBaseUrl);

  if (internalApiBaseUrl) {
    validateAbsoluteUrl("INTERNAL_API_BASE_URL", internalApiBaseUrl);
  }

  if (isProduction()) {
    validateProductionUrl("APP_URL", appUrl);
    validateProductionUrl("NEXT_PUBLIC_API_BASE_URL", apiBaseUrl);

    if (internalApiBaseUrl) {
      validateProductionUrl("INTERNAL_API_BASE_URL", internalApiBaseUrl);
    }
  }
}

function getDatabaseConfig() {
  return {
    protocol: process.env.DB_PROTOCOL || "mysql",
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    name: process.env.DB_NAME || "finance_tracker",
    user: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || "",
    url: buildDatabaseUrl(),
  };
}

function ensureRuntimeEnv(scope = "backend") {
  loadEnvFiles(scope);
  process.env.DATABASE_URL = buildDatabaseUrl();
  if (scope === "frontend") {
    validateFrontendEnv();
  } else {
    validateProductionEnv();
  }
  return process.env;
}

module.exports = {
  backendRoot,
  buildDatabaseUrl,
  DEFAULT_AUTH_SECRET,
  ensureRuntimeEnv,
  frontendRoot,
  getAllowedOrigins,
  getDatabaseConfig,
  getServerConfig,
  isProduction,
  normalizeListenHost,
  projectRoot,
  validateFrontendEnv,
  validateProductionEnv,
};
