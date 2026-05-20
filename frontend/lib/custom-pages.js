function getInternalApiBaseUrl() {
  return (process.env.INTERNAL_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:4000").replace(/\/$/, "");
}

export async function getPublicCustomPageBySlug(slug) {
  const response = await fetch(`${getInternalApiBaseUrl()}/api/pages/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to load page");
  }

  const data = await response.json();
  return data.item || null;
}

export async function getPublicPolicyPages() {
  const response = await fetch(`${getInternalApiBaseUrl()}/api/pages/policy`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load policy pages");
  }

  const data = await response.json();
  return Array.isArray(data.items) ? data.items : [];
}
