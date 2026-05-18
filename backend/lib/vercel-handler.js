import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import runtimeEnv from "../config/runtime-env.cjs";
import { getPrismaClient, isRetryableDatabaseError, resetPrismaClient } from "./prisma.js";
import { runWithRequestContext } from "./request-context.js";
import { getUploadsRoot } from "./uploads.js";

runtimeEnv.ensureRuntimeEnv("backend");

const serverConfig = runtimeEnv.getServerConfig();
const apiRoot = path.join(runtimeEnv.backendRoot, "app", "api");
const routeModuleCache = new Map();
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
  } else if (!origin && serverConfig.allowedOrigins[0]) {
    headers.set("Access-Control-Allow-Origin", serverConfig.allowedOrigins[0]);
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

    if (!isOriginAllowed(getRequestOrigin(request))) {
      return jsonResponse(request, 403, { error: "Origin not allowed" }, requestId);
    }

    if (request.method === "OPTIONS") {
      return withCors(request, new Response(null, { status: 204 }), requestId);
    }

    if (pathname === "/health" || pathname === "/api/health") {
      return jsonResponse(
        request,
        200,
        {
          service: "smart-finance-backend",
          status: "ok",
          mode: "vercel",
          timestamp: new Date().toISOString(),
        },
        requestId,
      );
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
