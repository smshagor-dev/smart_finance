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

const routeModuleCache = new Map();
const rateLimitStore = new Map();
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

function getServerConfig() {
  runtimeEnv.ensureRuntimeEnv("backend");
  return runtimeEnv.getServerConfig();
}

function getHost() {
  return getServerConfig().host;
}

function getPort() {
  return getServerConfig().port;
}

function getApiRoot() {
  return path.join(runtimeEnv.backendRoot, "app", "api");
}

function getUploadsRootPath() {
  runtimeEnv.ensureRuntimeEnv("backend");
  return getUploadsRoot();
}

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

  return getServerConfig().allowedOrigins.includes(origin);
}

function setCorsHeaders(req, res) {
  const origin = getRequestOrigin(req);

  setSecurityHeaders(res);
  res.setHeader("Vary", "Origin");

  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (!origin && getServerConfig().allowedOrigins[0]) {
    res.setHeader("Access-Control-Allow-Origin", getServerConfig().allowedOrigins[0]);
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

    const relativePath = path.relative(getApiRoot(), fullPath).replace(/\\/g, "/");
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

let routesCache = null;

function getRoutes() {
  if (!routesCache) {
    routesCache = getRouteEntries(getApiRoot());
  }

  return routesCache;
}

function matchRoute(pathname) {
  const requestSegments = pathname.split("/").filter(Boolean);

  for (const route of getRoutes()) {
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
  const hostHeader = req.headers.host || `${getHost()}:${getPort()}`;
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
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  );
  res.writeHead(statusCode, { "Content-Type": "text/html; charset=utf-8" });
  res.end(markup);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function wantsHtmlResponse(req) {
  const accept = String(req.headers.accept || "").toLowerCase();
  return accept.includes("text/html");
}

function getRequestOriginDetails(req) {
  const protocol = String(req.headers["x-forwarded-proto"] || "http").split(",")[0].trim() || "http";
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "localhost").split(",")[0].trim() || "localhost";
  return {
    protocol,
    host,
    origin: `${protocol}://${host}`,
  };
}

function renderStatusPill(label, tone = "neutral") {
  const toneStyles = {
    success: "background:rgba(22,163,74,.12);color:#166534;border-color:rgba(22,163,74,.18);",
    danger: "background:rgba(220,38,38,.12);color:#991b1b;border-color:rgba(220,38,38,.18);",
    neutral: "background:rgba(15,23,42,.06);color:#172033;border-color:rgba(15,23,42,.08);",
  };

  return `<span style="display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border-radius:999px;border:1px solid ${toneStyles[tone] || toneStyles.neutral}font:700 12px/1 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;">${escapeHtml(label)}</span>`;
}

function renderHomePage(req) {
  const { origin } = getRequestOriginDetails(req);
  const serverConfig = getServerConfig();

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Smart Finance API</title>
  </head>
  <body style="margin:0;font-family:'Segoe UI',Arial,sans-serif;background:
    radial-gradient(circle at top left,rgba(34,197,94,.18),transparent 24%),
    radial-gradient(circle at top right,rgba(249,115,22,.18),transparent 28%),
    linear-gradient(160deg,#07111f 0%,#10233a 48%,#f6f0e8 48%,#f7f4ee 100%);
    color:#0f172a;">
    <main style="max-width:1180px;margin:0 auto;padding:28px 18px 54px;">
      <section style="overflow:hidden;border-radius:34px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.72);box-shadow:0 30px 90px rgba(2,8,23,.22);backdrop-filter:blur(12px);">
        <div style="padding:34px 28px 22px;background:
          linear-gradient(135deg,rgba(7,17,31,.94),rgba(16,35,58,.88)),
          radial-gradient(circle at top right,rgba(34,197,94,.18),transparent 25%);color:#f8fafc;">
          ${renderStatusPill("Backend Live", "success")}
          <h1 style="margin:18px 0 10px;font-size:clamp(38px,7vw,78px);line-height:.92;letter-spacing:-.06em;">Smart Finance<br/>Control Surface</h1>
          <p style="max-width:760px;margin:0;font-size:18px;line-height:1.75;color:rgba(248,250,252,.82);">
            Your backend is online. This landing page gives you a quick operational snapshot and direct access to the visual health pages for browser checks and API monitoring.
          </p>
          <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:22px;">
            <a href="${origin}/health" style="display:inline-flex;align-items:center;justify-content:center;padding:13px 18px;border-radius:16px;background:#f8fafc;color:#0f172a;text-decoration:none;font:700 14px/1 Arial,sans-serif;">Open Health Dashboard</a>
            <a href="${origin}/api/health" style="display:inline-flex;align-items:center;justify-content:center;padding:13px 18px;border-radius:16px;border:1px solid rgba(248,250,252,.22);background:rgba(248,250,252,.08);color:#f8fafc;text-decoration:none;font:700 14px/1 Arial,sans-serif;">Open API Health Endpoint</a>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;padding:22px 22px 28px;">
          <article style="padding:22px;border-radius:24px;background:#fff;border:1px solid rgba(15,23,42,.08);">
            <p style="margin:0 0 12px;font:800 12px/1 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#b45309;">Runtime</p>
            <p style="margin:0;font-size:28px;line-height:1.12;color:#0f172a;">${process.env.VERCEL ? "Vercel" : "Node Server"}</p>
            <p style="margin:12px 0 0;font-size:14px;line-height:1.7;color:#475569;">Serving from <code>${escapeHtml(origin)}</code></p>
          </article>
          <article style="padding:22px;border-radius:24px;background:#fff;border:1px solid rgba(15,23,42,.08);">
            <p style="margin:0 0 12px;font:800 12px/1 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#b45309;">Frontend Link</p>
            <p style="margin:0;font-size:24px;line-height:1.25;color:#0f172a;">${escapeHtml(serverConfig.frontendUrl || "-")}</p>
            <p style="margin:12px 0 0;font-size:14px;line-height:1.7;color:#475569;">Allowed origins are validated from runtime environment settings.</p>
          </article>
          <article style="padding:22px;border-radius:24px;background:linear-gradient(135deg,#fff7ed,#ffffff);border:1px solid rgba(249,115,22,.14);">
            <p style="margin:0 0 12px;font:800 12px/1 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#b45309;">Browser Checks</p>
            <p style="margin:0 0 8px;font-size:15px;line-height:1.6;"><a href="${origin}/health" style="color:#0f172a;font-weight:700;">${escapeHtml(origin)}/health</a></p>
            <p style="margin:0;font-size:15px;line-height:1.6;"><a href="${origin}/api/health" style="color:#0f172a;font-weight:700;">${escapeHtml(origin)}/api/health</a></p>
          </article>
        </div>
      </section>
    </main>
  </body>
</html>`;
}

function getClientIp(req) {
  if (getServerConfig().trustProxy) {
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
      maxRequests: getServerConfig().authRateLimitMaxRequests,
    };
  }

  return {
    key: `general:${getClientIp(req)}`,
    maxRequests: getServerConfig().rateLimitMaxRequests,
  };
}

function enforceRateLimit(req) {
  const now = Date.now();
  const { key, maxRequests } = getRateLimitBucket(req);
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + getServerConfig().rateLimitWindowMs,
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
  return Number.isFinite(contentLength) && contentLength > getServerConfig().requestSizeLimitBytes;
}

function getUploadsFilePath(pathname) {
  const relativePath = pathname.replace(/^\/uploads\//, "");
  const normalizedPath = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  const uploadsRoot = getUploadsRootPath();
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
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
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
  const isApiHealth = req.url === "/api/health";
  const { origin } = getRequestOriginDetails(req);
  const wantsHtml = req.url === "/health" || (isApiHealth && wantsHtmlResponse(req));

  function renderHealthPage(payload) {
    const isOk = payload.status === "ok";
    const accent = isOk ? "#16a34a" : "#dc2626";
    const panelTone = isOk ? "rgba(22,163,74,.12)" : "rgba(220,38,38,.12)";
    const errorDetails = payload.database.error
      ? `<pre style="margin:16px 0 0;padding:16px;border-radius:18px;background:#0f172a;color:#e2e8f0;overflow:auto;white-space:pre-wrap;font:500 13px/1.7 Consolas,monospace;">${escapeHtml(payload.database.error)}</pre>`
      : "";
    const endpointLabel = payload.endpoint === "/api/health" ? "API Health Endpoint" : "Health Dashboard";

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Backend Health</title>
  </head>
  <body style="margin:0;background:
    radial-gradient(circle at top left,${panelTone},transparent 24%),
    linear-gradient(180deg,#f8fafc 0%,#eef4f1 100%);
    color:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
    <main style="max-width:980px;margin:0 auto;padding:28px 18px 48px;">
      <section style="overflow:hidden;border-radius:32px;border:1px solid rgba(15,23,42,.08);background:rgba(255,255,255,.88);box-shadow:0 26px 70px rgba(15,23,42,.12);">
        <div style="padding:30px 26px 24px;background:
          linear-gradient(135deg,#0f172a,#13263f),
          radial-gradient(circle at top right,${panelTone},transparent 25%);color:#f8fafc;">
          ${renderStatusPill(isOk ? "System Healthy" : "Attention Required", isOk ? "success" : "danger")}
          <h1 style="margin:18px 0 10px;font-size:clamp(30px,6vw,56px);line-height:.96;letter-spacing:-.05em;">${escapeHtml(endpointLabel)}</h1>
          <p style="max-width:680px;margin:0;font-size:17px;line-height:1.75;color:rgba(248,250,252,.82);">
            Live status for <strong>${escapeHtml(payload.service)}</strong>. This page confirms backend reachability and the current database connection state.
          </p>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;padding:22px;">
          <article style="padding:20px;border-radius:24px;background:#fff;border:1px solid rgba(15,23,42,.08);">
            <p style="margin:0 0 10px;font:800 12px/1 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#b45309;">Service Status</p>
            <p style="margin:0;font-size:28px;line-height:1.1;color:${accent};text-transform:capitalize;">${escapeHtml(payload.status)}</p>
            <p style="margin:10px 0 0;font-size:14px;line-height:1.7;color:#475569;">Endpoint: <code>${escapeHtml(payload.endpoint)}</code></p>
          </article>
          <article style="padding:20px;border-radius:24px;background:#fff;border:1px solid rgba(15,23,42,.08);">
            <p style="margin:0 0 10px;font:800 12px/1 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#b45309;">Database</p>
            <p style="margin:0;font-size:28px;line-height:1.1;color:#0f172a;text-transform:capitalize;">${escapeHtml(payload.database.status)}</p>
            <p style="margin:10px 0 0;font-size:14px;line-height:1.7;color:#475569;">Live database connectivity check result.</p>
          </article>
          <article style="padding:20px;border-radius:24px;background:linear-gradient(135deg,#eff6ff,#ffffff);border:1px solid rgba(59,130,246,.14);">
            <p style="margin:0 0 10px;font:800 12px/1 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#1d4ed8;">Checked At</p>
            <p style="margin:0;font-size:18px;line-height:1.5;color:#0f172a;"><code>${escapeHtml(payload.timestamp)}</code></p>
            <p style="margin:10px 0 0;font-size:14px;line-height:1.7;color:#475569;">Origin: <code>${escapeHtml(origin)}</code></p>
          </article>
        </div>
        <div style="padding:0 22px 24px;">
          <div style="padding:20px;border-radius:24px;background:#fff7ed;border:1px solid rgba(249,115,22,.14);">
            <p style="margin:0 0 10px;font:800 12px/1 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#c2410c;">Quick Links</p>
            <p style="margin:0 0 8px;font-size:15px;line-height:1.6;"><a href="${origin}/" style="color:#0f172a;font-weight:700;">${escapeHtml(origin)}/</a></p>
            <p style="margin:0 0 8px;font-size:15px;line-height:1.6;"><a href="${origin}/health" style="color:#0f172a;font-weight:700;">${escapeHtml(origin)}/health</a></p>
            <p style="margin:0;font-size:15px;line-height:1.6;"><a href="${origin}/api/health" style="color:#0f172a;font-weight:700;">${escapeHtml(origin)}/api/health</a></p>
          </div>
        </div>
        ${errorDetails}
      </section>
    </main>
  </body>
</html>`;
  }

  try {
    await prisma.$connect();
    if (db.protocol.startsWith("mongodb")) {
      await prisma.$runCommandRaw({ ping: 1 });
    } else {
      await prisma.$queryRawUnsafe("SELECT 1");
    }
    const payload = {
      service: "smart-finance-backend",
      status: "ok",
      endpoint: isApiHealth ? "/api/health" : "/health",
      database: {
        status: "connected",
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
      endpoint: isApiHealth ? "/api/health" : "/health",
      database: {
        status: "disconnected",
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

async function handleNodeRequest(req, res) {
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

    if (req.url === "/" || req.url === "/index.html") {
      html(req, res, 200, renderHomePage(req), requestId);
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
      response = await executeHandler();
    } catch (error) {
      if (!isRetryableDatabaseError(error)) {
        throw error;
      }

      await resetPrismaClient();
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
}

export default handleNodeRequest;

const server = http.createServer(handleNodeRequest);
const serverConfig = getServerConfig();
const host = process.env.VERCEL ? "0.0.0.0" : getHost();
const port = Number(process.env.PORT || getPort());

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
