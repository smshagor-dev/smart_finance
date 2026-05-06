import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { Readable } from "node:stream";
import { pathToFileURL } from "node:url";
import runtimeEnv from "./config/runtime-env.cjs";
import { getPrismaClient, isRetryableDatabaseError, resetPrismaClient } from "./lib/prisma.js";
import { runWithRequestContext } from "./lib/request-context.js";
import { getUploadsRoot } from "./lib/uploads.js";

runtimeEnv.ensureRuntimeEnv("backend");

const serverConfig = runtimeEnv.getServerConfig();
const host = serverConfig.host;
const port = serverConfig.port;
const apiRoot = path.join(runtimeEnv.backendRoot, "app", "api");
const routeModuleCache = new Map();
const rateLimitStore = new Map();
const uploadsRoot = getUploadsRoot();
const contentTypeByExtension = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".gif", "image/gif"],
  [".svg", "image/svg+xml"],
  [".ico", "image/x-icon"],
  [".bmp", "image/bmp"],
  [".tiff", "image/tiff"],
  [".pdf", "application/pdf"],
  [".txt", "text/plain; charset=utf-8"],
  [".doc", "application/msword"],
  [".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  [".xls", "application/vnd.ms-excel"],
  [".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
]);

function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");

  if (runtimeEnv.isProduction()) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
}

function getRequestOrigin(req) {
  return String(req.headers.origin || "").trim().replace(/\/$/, "");
}

function isOriginAllowed(origin) {
  if (!origin) {
    return true;
  }

  return serverConfig.allowedOrigins.includes(origin);
}

function setCorsHeaders(req, res) {
  const origin = getRequestOrigin(req);

  setSecurityHeaders(res);
  res.setHeader("Vary", "Origin");

  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (!origin && serverConfig.allowedOrigins[0]) {
    res.setHeader("Access-Control-Allow-Origin", serverConfig.allowedOrigins[0]);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie, X-Requested-With");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
}

function getRouteEntries(dir) {
  const entries = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      entries.push(...getRouteEntries(fullPath));
      continue;
    }

    if (entry.name !== "route.js") {
      continue;
    }

    const relativePath = path.relative(apiRoot, fullPath).replace(/\\/g, "/");
    const apiPath = `/api/${relativePath.replace(/\/route\.js$/, "").replace(/(^|\/)\[(.+?)\]/g, (_, slash, segment) => `${slash}:${segment}`)}`;
    const segments = apiPath.split("/").filter(Boolean);
    const score = segments.reduce((total, segment) => total + (segment.startsWith(":") ? 1 : 10), 0);

    entries.push({
      filePath: fullPath,
      pattern: apiPath,
      score,
    });
  }

  return entries.sort((a, b) => b.score - a.score);
}

const routes = getRouteEntries(apiRoot);

function matchRoute(pathname) {
  const requestSegments = pathname.split("/").filter(Boolean);

  for (const route of routes) {
    const routeSegments = route.pattern.split("/").filter(Boolean);
    if (routeSegments.length !== requestSegments.length) {
      continue;
    }

    const params = {};
    let matched = true;

    for (let index = 0; index < routeSegments.length; index += 1) {
      const routeSegment = routeSegments[index];
      const requestSegment = requestSegments[index];

      if (routeSegment.startsWith(":")) {
        params[routeSegment.slice(1)] = decodeURIComponent(requestSegment);
        continue;
      }

      if (routeSegment !== requestSegment) {
        matched = false;
        break;
      }
    }

    if (matched) {
      return { route, params };
    }
  }

  return null;
}

async function loadRouteModule(filePath) {
  const stat = fs.statSync(filePath);
  const cached = routeModuleCache.get(filePath);

  if (cached && cached.mtimeMs === stat.mtimeMs) {
    return cached.module;
  }

  const module = await import(`${pathToFileURL(filePath).href}?mtime=${stat.mtimeMs}`);
  routeModuleCache.set(filePath, { mtimeMs: stat.mtimeMs, module });
  return module;
}

function createWebRequest(req) {
  const controller = new AbortController();
  req.on("aborted", () => controller.abort());

  const protocol = (req.headers["x-forwarded-proto"] || "http").toString().split(",")[0].trim() || "http";
  const hostHeader = req.headers.host || `${host}:${port}`;
  const url = `${protocol}://${hostHeader}${req.url || "/"}`;
  const init = {
    method: req.method,
    headers: req.headers,
    signal: controller.signal,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = Readable.toWeb(req);
    init.duplex = "half";
  }

  return new Request(url, init);
}

async function sendResponse(req, res, response, requestId) {
  setCorsHeaders(req, res);
  res.setHeader("X-Request-Id", requestId);

  const outgoingResponse =
    runtimeEnv.isProduction() && response.status >= 500
      ? Response.json({ error: "Internal server error", requestId }, { status: response.status })
      : response;

  res.statusCode = outgoingResponse.status;

  const setCookies = typeof outgoingResponse.headers.getSetCookie === "function" ? outgoingResponse.headers.getSetCookie() : [];
  if (setCookies.length) {
    res.setHeader("Set-Cookie", setCookies);
  }

  outgoingResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      return;
    }

    res.setHeader(key, value);
  });

  if (!outgoingResponse.body) {
    res.end();
    return;
  }

  await new Promise((resolve, reject) => {
    Readable.fromWeb(outgoingResponse.body).pipe(res);
    res.on("finish", resolve);
    res.on("error", reject);
  });
}

function json(req, res, statusCode, payload, requestId) {
  setCorsHeaders(req, res);
  res.setHeader("X-Request-Id", requestId);
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function html(req, res, statusCode, markup, requestId) {
  setCorsHeaders(req, res);
  res.setHeader("X-Request-Id", requestId);
  res.writeHead(statusCode, { "Content-Type": "text/html; charset=utf-8" });
  res.end(markup);
}

function getClientIp(req) {
  if (serverConfig.trustProxy) {
    const forwardedFor = String(req.headers["x-forwarded-for"] || "")
      .split(",")[0]
      .trim();

    if (forwardedFor) {
      return forwardedFor;
    }
  }

  return req.socket.remoteAddress || "unknown";
}

function getRateLimitBucket(req) {
  if ((req.url || "").startsWith("/api/auth/")) {
    return {
      key: `auth:${getClientIp(req)}`,
      maxRequests: serverConfig.authRateLimitMaxRequests,
    };
  }

  return {
    key: `general:${getClientIp(req)}`,
    maxRequests: serverConfig.rateLimitMaxRequests,
  };
}

function enforceRateLimit(req) {
  const now = Date.now();
  const { key, maxRequests } = getRateLimitBucket(req);
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + serverConfig.rateLimitWindowMs,
    });
    return null;
  }

  entry.count += 1;
  if (entry.count > maxRequests) {
    return Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
  }

  return null;
}

function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

function isRequestTooLarge(req) {
  const contentLength = Number(req.headers["content-length"] || 0);
  return Number.isFinite(contentLength) && contentLength > serverConfig.requestSizeLimitBytes;
}

function getUploadsFilePath(pathname) {
  const relativePath = pathname.replace(/^\/uploads\//, "");
  const normalizedPath = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  const targetPath = path.resolve(uploadsRoot, normalizedPath);
  const resolvedRoot = path.resolve(uploadsRoot);

  if (!targetPath.startsWith(resolvedRoot)) {
    return null;
  }

  return targetPath;
}

function getContentType(filePath) {
  return contentTypeByExtension.get(path.extname(filePath).toLowerCase()) || "application/octet-stream";
}

async function handleUploadsRequest(req, res, pathname, requestId) {
  const filePath = getUploadsFilePath(pathname);
  if (!filePath) {
    json(req, res, 404, { error: "Not found" }, requestId);
    return true;
  }

  try {
    const stat = await fs.promises.stat(filePath);
    if (!stat.isFile()) {
      json(req, res, 404, { error: "Not found" }, requestId);
      return true;
    }

    setCorsHeaders(req, res);
    res.setHeader("X-Request-Id", requestId);
    res.setHeader("Content-Type", getContentType(filePath));
    res.setHeader("Content-Length", stat.size);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.writeHead(200);
    fs.createReadStream(filePath).pipe(res);
    return true;
  } catch {
    json(req, res, 404, { error: "Not found" }, requestId);
    return true;
  }
}

async function handleHealth(req, res, requestId) {
  const db = runtimeEnv.getDatabaseConfig();
  const prisma = getPrismaClient();
  const wantsHtml = req.url === "/health";

  function renderHealthPage(payload) {
    const isOk = payload.status === "ok";
    const errorDetails = payload.database.error
      ? `<pre style="margin:16px 0 0;padding:16px;border-radius:16px;background:#0f172a;color:#e2e8f0;overflow:auto;white-space:pre-wrap;">${payload.database.error}</pre>`
      : "";

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Backend Health</title>
  </head>
  <body style="margin:0;background:#f8fafc;color:#0f172a;font-family:Segoe UI,Arial,sans-serif;">
    <main style="max-width:760px;margin:40px auto;padding:24px;">
      <section style="background:#fff;border:1px solid #e2e8f0;border-radius:24px;padding:24px;box-shadow:0 10px 30px rgba(15,23,42,.06);">
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
          <span style="display:inline-block;width:14px;height:14px;border-radius:999px;background:${isOk ? "#16a34a" : "#dc2626"};"></span>
          <h1 style="margin:0;font-size:28px;">${payload.service}</h1>
        </div>
        <p style="margin:12px 0 0;font-size:18px;">Status: <strong>${payload.status}</strong></p>
        <p style="margin:8px 0 0;">Database: <strong>${payload.database.status}</strong></p>
        <p style="margin:8px 0 0;">Host: <code>${payload.database.host}:${payload.database.port}</code></p>
        <p style="margin:8px 0 0;">Database name: <code>${payload.database.name}</code></p>
        <p style="margin:8px 0 0;">User: <code>${payload.database.user || "-"}</code></p>
        <p style="margin:8px 0 0;">Checked at: <code>${payload.timestamp}</code></p>
        ${errorDetails}
      </section>
    </main>
  </body>
</html>`;
  }

  try {
    await prisma.$connect();
    await prisma.$queryRawUnsafe("SELECT 1");
    const payload = {
      service: "smart-finance-backend",
      status: "ok",
      database: {
        status: "connected",
        host: db.host,
        port: db.port,
        name: db.name,
        user: db.user,
      },
      timestamp: new Date().toISOString(),
    };

    if (wantsHtml) {
      html(req, res, 200, renderHealthPage(payload), requestId);
      return;
    }

    json(req, res, 200, payload, requestId);
  } catch (error) {
    const payload = {
      service: "smart-finance-backend",
      status: "degraded",
      database: {
        status: "disconnected",
        host: db.host,
        port: db.port,
        name: db.name,
        user: db.user,
        error: runtimeEnv.isProduction() ? "Database unavailable" : error.message,
      },
      timestamp: new Date().toISOString(),
    };

    if (wantsHtml) {
      html(req, res, 503, renderHealthPage(payload), requestId);
      return;
    }

    json(req, res, 503, payload, requestId);
  }
}

const server = http.createServer(async (req, res) => {
  const requestId = crypto.randomUUID();

  try {
    if (!req.url) {
      json(req, res, 400, { error: "Invalid request URL" }, requestId);
      return;
    }

    if (!isOriginAllowed(getRequestOrigin(req))) {
      json(req, res, 403, { error: "Origin not allowed" }, requestId);
      return;
    }

    if (req.method === "OPTIONS") {
      setCorsHeaders(req, res);
      res.setHeader("X-Request-Id", requestId);
      res.writeHead(204);
      res.end();
      return;
    }

    const retryAfterSeconds = enforceRateLimit(req);
    if (retryAfterSeconds) {
      res.setHeader("Retry-After", String(retryAfterSeconds));
      json(req, res, 429, { error: "Too many requests" }, requestId);
      return;
    }

    if (isRequestTooLarge(req)) {
      json(req, res, 413, { error: "Request body too large" }, requestId);
      return;
    }

    if (req.url === "/health" || req.url === "/api/health") {
      await handleHealth(req, res, requestId);
      return;
    }

    const pathname = new URL(req.url, `http://${req.headers.host || `${host}:${port}`}`).pathname;

    if (pathname.startsWith("/uploads/")) {
      await handleUploadsRequest(req, res, pathname, requestId);
      return;
    }

    const matched = matchRoute(pathname);

    if (!matched) {
      json(req, res, 404, { error: "Not found" }, requestId);
      return;
    }

    const routeModule = await loadRouteModule(matched.route.filePath);
    const handler = routeModule[req.method];

    if (!handler) {
      json(req, res, 405, { error: "Method not allowed" }, requestId);
      return;
    }

    const webRequest = createWebRequest(req);
    const executeHandler = async () =>
      runWithRequestContext({ request: webRequest }, () =>
        handler(webRequest, { params: Promise.resolve(matched.params) }),
      );

    let response;
    try {
      const prisma = getPrismaClient();
      await prisma.$connect();
      response = await executeHandler();
    } catch (error) {
      if (!isRetryableDatabaseError(error)) {
        throw error;
      }

      const prisma = await resetPrismaClient();
      await prisma.$connect();
      response = await executeHandler();
    }

    await sendResponse(req, res, response instanceof Response ? response : Response.json(response), requestId);
  } catch (error) {
    console.error(`[${requestId}] Backend request failed`, error);
    json(
      req,
      res,
      500,
      runtimeEnv.isProduction() ? { error: "Internal server error", requestId } : { error: error.message || "Internal server error", requestId },
      requestId,
    );
  }
});

server.requestTimeout = serverConfig.requestTimeoutMs;
server.headersTimeout = serverConfig.headersTimeoutMs;
server.keepAliveTimeout = serverConfig.keepAliveTimeoutMs;

const rateLimitCleanupInterval = setInterval(cleanupRateLimitStore, serverConfig.rateLimitWindowMs);
rateLimitCleanupInterval.unref();

server.listen(port, host, () => {
  console.log(`> Backend ready on http://${host}:${port}`);
});

async function shutdown(signal) {
  console.log(`> Received ${signal}. Shutting down backend...`);
  clearInterval(rateLimitCleanupInterval);
  server.close(async () => {
    try {
      const prisma = getPrismaClient();
      await prisma.$disconnect();
    } finally {
      process.exit(0);
    }
  });

  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
