function getInternalApiBaseUrl() {
  return (process.env.INTERNAL_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:4000").replace(/\/$/, "");
}

export async function getPublicSiteSettings() {
  const response = await fetch(`${getInternalApiBaseUrl()}/api/public/site-settings`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load site settings");
  }

  return response.json();
}
