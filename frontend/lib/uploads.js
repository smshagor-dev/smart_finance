function normalizeBaseUrl(value) {
  if (!value || typeof value !== "string") {
    return "";
  }

  try {
    const url = new URL(value.trim());
    if (url.hostname.toLowerCase() === "localhost") {
      url.hostname = "127.0.0.1";
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

function getUploadsBaseUrl() {
  return normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL || process.env.INTERNAL_API_BASE_URL || "");
}

export function resolveAssetUrl(value) {
  if (!value || typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (/^(https?:|data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    if (trimmed.startsWith("/uploads/")) {
      const baseUrl = getUploadsBaseUrl();
      return baseUrl ? `${baseUrl}${trimmed}` : trimmed;
    }
    return trimmed;
  }

  const normalizedPath = `/${trimmed.replace(/^\/+/, "")}`;
  if (normalizedPath.startsWith("/uploads/")) {
    const baseUrl = getUploadsBaseUrl();
    return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
  }

  return normalizedPath;
}
