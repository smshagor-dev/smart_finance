import { getPublicSiteSettings } from "@/lib/site-settings";

function getIconType(src) {
  if (src.endsWith(".svg")) return "image/svg+xml";
  if (src.endsWith(".ico")) return "image/x-icon";
  if (src.endsWith(".webp")) return "image/webp";
  return "image/png";
}

export default async function manifest() {
  let siteSettings;

  try {
    siteSettings = await getPublicSiteSettings();
  } catch {
    siteSettings = {
      siteName: "Finance Tracker",
      siteDescription: "Personal finance tracker",
      iconUrl: null,
    };
  }

  const iconSrc = siteSettings.iconUrl || "/next.svg";
  const iconType = getIconType(iconSrc);

  return {
    name: siteSettings.siteName || "Finance Tracker",
    short_name: siteSettings.siteName || "Finance Tracker",
    description: siteSettings.siteDescription || "Personal finance tracker",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f172a",
    icons: [
      {
        src: iconSrc,
        sizes: "192x192",
        type: iconType,
      },
      {
        src: iconSrc,
        sizes: "512x512",
        type: iconType,
      },
      {
        src: iconSrc,
        sizes: "512x512",
        type: iconType,
        purpose: "any maskable",
      },
    ],
  };
}
