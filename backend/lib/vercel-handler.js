import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import runtimeEnv from "../config/runtime-env.cjs";
import { getPrismaClient, isRetryableDatabaseError, resetPrismaClient } from "./prisma.js";
import { runWithRequestContext } from "./request-context.js";
import { getUploadsRoot } from "./uploads.js";

const routeModuleCache = new Map();
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

function getApiRoot() {
  return path.join(runtimeEnv.backendRoot, "app", "api");
}

function getUploadsRootPath() {
  runtimeEnv.ensureRuntimeEnv("backend");
  return getUploadsRoot();
}

function setSecurityHeaders(headers) {
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Resource-Policy", "same-origin");
  headers.set("X-Permitted-Cross-Domain-Policies", "none");
  headers.set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");

  if (runtimeEnv.isProduction()) {
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
}

function getRequestOrigin(request) {
  return String(request.headers.get("origin") || "").trim().replace(/\/$/, "");
}

function isOriginAllowed(origin) {
  const serverConfig = getServerConfig();
  if (!origin) {
    return true;
  }

  return serverConfig.allowedOrigins.includes(origin);
}

function applyCorsHeaders(request, headers) {
  const origin = getRequestOrigin(request);
  setSecurityHeaders(headers);
  headers.set("Vary", "Origin");

  if (origin && isOriginAllowed(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  } else if (!origin && getServerConfig().allowedOrigins[0]) {
    headers.set("Access-Control-Allow-Origin", getServerConfig().allowedOrigins[0]);
  }

  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie, X-Requested-With");
  headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
}

function withCors(request, response, requestId) {
  const headers = new Headers(response.headers);
  applyCorsHeaders(request, headers);
  headers.set("X-Request-Id", requestId);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function jsonResponse(request, statusCode, payload, requestId) {
  return withCors(
    request,
    Response.json(payload, {
      status: statusCode,
    }),
    requestId,
  );
}

function htmlResponse(request, statusCode, markup, requestId) {
  return withCors(
    request,
    new Response(markup, {
      status: statusCode,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Security-Policy":
          "default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
      },
    }),
    requestId,
  );
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function wantsHtmlResponse(request) {
  const accept = String(request.headers.get("accept") || "").toLowerCase();
  return accept.includes("text/html");
}

function getRequestOriginDetails(request) {
  const url = new URL(request.url);
  return {
    protocol: url.protocol.replace(/:$/, ""),
    host: url.host,
    origin: url.origin,
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

function renderHomePage(request) {
  const { origin } = getRequestOriginDetails(request);
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
            <p style="margin:0;font-size:28px;line-height:1.12;color:#0f172a;">Vercel</p>
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

function renderHealthPage(payload, origin) {
  const isOk = payload.status === "ok";
  const accent = isOk ? "#16a34a" : "#dc2626";
  const panelTone = isOk ? "rgba(22,163,74,.12)" : "rgba(220,38,38,.12)";
  const errorDetails = payload.database?.error
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

async function handleUploadsRequest(request, pathname, requestId) {
  const filePath = getUploadsFilePath(pathname);
  if (!filePath) {
    return jsonResponse(request, 404, { error: "Not found" }, requestId);
  }

  try {
    const stat = await fs.promises.stat(filePath);
    if (!stat.isFile()) {
      return jsonResponse(request, 404, { error: "Not found" }, requestId);
    }

    const buffer = await fs.promises.readFile(filePath);
    return withCors(
      request,
      new Response(buffer, {
        status: 200,
        headers: {
          "Content-Type": getContentType(filePath),
          "Content-Length": String(stat.size),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      }),
      requestId,
    );
  } catch {
    return jsonResponse(request, 404, { error: "Not found" }, requestId);
  }
}

export async function handleBackendRequest(request) {
  const requestId = crypto.randomUUID();

  try {
    const pathname = new URL(request.url).pathname;
    const { origin } = getRequestOriginDetails(request);

    if (!isOriginAllowed(getRequestOrigin(request))) {
      return jsonResponse(request, 403, { error: "Origin not allowed" }, requestId);
    }

    if (request.method === "OPTIONS") {
      return withCors(request, new Response(null, { status: 204 }), requestId);
    }

    if (pathname === "/" || pathname === "/index.html") {
      return htmlResponse(request, 200, renderHomePage(request), requestId);
    }

    if (pathname === "/health" || pathname === "/api/health") {
      const payload = {
        service: "smart-finance-backend",
        status: "ok",
        endpoint: pathname,
        mode: "vercel",
        database: {
          status: "connected",
        },
        timestamp: new Date().toISOString(),
      };

      if (pathname === "/health" || (pathname === "/api/health" && wantsHtmlResponse(request))) {
        return htmlResponse(request, 200, renderHealthPage(payload, origin), requestId);
      }

      return jsonResponse(request, 200, payload, requestId);
    }

    if (pathname.startsWith("/uploads/")) {
      return handleUploadsRequest(request, pathname, requestId);
    }

    const matched = matchRoute(pathname);
    if (!matched) {
      return jsonResponse(request, 404, { error: "Not found" }, requestId);
    }

    const routeModule = await loadRouteModule(matched.route.filePath);
    const handler = routeModule[request.method];

    if (!handler) {
      return jsonResponse(request, 405, { error: "Method not allowed" }, requestId);
    }

    const executeHandler = async () =>
      runWithRequestContext({ request }, () =>
        handler(request, { params: Promise.resolve(matched.params) }),
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

    const normalizedResponse = response instanceof Response ? response : Response.json(response);
    return withCors(request, normalizedResponse, requestId);
  } catch (error) {
    console.error(`[${requestId}] Vercel backend request failed`, error);
    return jsonResponse(
      request,
      500,
      runtimeEnv.isProduction() ? { error: "Internal server error", requestId } : { error: error.message || "Internal server error", requestId },
      requestId,
    );
  }
}
