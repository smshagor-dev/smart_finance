import path from "node:path";
import { fileURLToPath } from "node:url";

function normalizeLoopbackUrl(value) {
  if (!value) {
    return value;
  }

  try {
    const url = new URL(value);
    if (url.hostname.toLowerCase() === "localhost") {
      url.hostname = "127.0.0.1";
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    return value.replace(/\/$/, "");
  }
}

const apiBaseUrl = normalizeLoopbackUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.INTERNAL_API_BASE_URL,
);
const isProduction = process.env.NODE_ENV === "production";

// Every client-side call in this app is a same-origin request to /api/* that only
// works because of the rewrites below. Building without an API base URL silently
// ships an app where every request 404s, so fail the build instead.
if (isProduction && !apiBaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL must be set at build time; without it the /api/* and /uploads/* rewrites are dropped and every API call returns 404.",
  );
}
const frontendRoot = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(frontendRoot, "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  output: "standalone",
  turbopack: {
    root: workspaceRoot,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          ...(isProduction
            ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]
            : []),
        ],
      },
    ];
  },
  async rewrites() {
    if (!apiBaseUrl) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${apiBaseUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
