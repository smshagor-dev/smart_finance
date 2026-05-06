const FALLBACK_BASE_URL = "http://localhost:3001";

function normalizeUrl(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(candidate).toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function getBaseUrl() {
  return (
    normalizeUrl(process.env.APP_URL) ||
    normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    normalizeUrl(process.env.VERCEL_URL) ||
    FALLBACK_BASE_URL
  );
}

export function getMetadataBaseUrl(value) {
  return new URL(normalizeUrl(value) || getBaseUrl());
}
