import { cookies } from "next/headers";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { FrontendNoCache } from "@/components/frontend-no-cache";
import { PwaRegistration } from "@/components/pwa-registration";
import { getPublicSiteSettings } from "@/lib/site-settings";
import { getMetadataBaseUrl } from "@/lib/app-url";
import { resolveAssetUrl } from "@/lib/uploads";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata() {
  let siteSettings;

  try {
    siteSettings = await getPublicSiteSettings();
  } catch {
    siteSettings = {
      siteName: "Finance Tracker",
      siteDescription: "Personal finance tracker",
      seoTitle: "Finance Tracker",
      seoDescription: "Personal finance tracker",
      seoKeywords: "",
      siteUrl: null,
      iconUrl: null,
      logoUrl: null,
    };
  }

  const title = siteSettings.seoTitle || siteSettings.siteName;
  const description = siteSettings.seoDescription || siteSettings.siteDescription;
  const iconUrl = resolveAssetUrl(siteSettings.logoUrl || siteSettings.iconUrl);
  const keywords = (siteSettings.seoKeywords || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    title: {
      default: title,
      template: `%s | ${siteSettings.siteName}`,
    },
    description,
    keywords,
    metadataBase: getMetadataBaseUrl(siteSettings.siteUrl),
    manifest: "/manifest.webmanifest",
    icons: iconUrl
      ? {
          icon: iconUrl,
          shortcut: iconUrl,
          apple: iconUrl,
        }
      : undefined,
  };
}

function themeInitializationScript(initialTheme) {
  return `
    (function() {
      try {
        var nodes = document.querySelectorAll('[bis_skin_checked]');
        for (var i = 0; i < nodes.length; i += 1) {
          nodes[i].removeAttribute('bis_skin_checked');
        }

        var stored = window.localStorage.getItem('finance_tracker_theme');
        var fallback = '${initialTheme}';
        var theme = stored === 'dark' || stored === 'light' ? stored : fallback;
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
      } catch (error) {
        document.documentElement.dataset.theme = '${initialTheme}';
        document.documentElement.style.colorScheme = '${initialTheme}';
      }
    })();
  `;
}

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("finance_tracker_theme")?.value === "dark" ? "dark" : "light";
  let siteSettings;

  try {
    siteSettings = await getPublicSiteSettings();
  } catch {
    siteSettings = { iconUrl: null, logoUrl: null };
  }

  return (
    <html lang="en" className="h-full antialiased" data-theme={theme} suppressHydrationWarning>
      <head>
        <script id="theme-init" dangerouslySetInnerHTML={{ __html: themeInitializationScript(theme) }} />
        {siteSettings.logoUrl || siteSettings.iconUrl ? <link rel="icon" href={resolveAssetUrl(siteSettings.logoUrl || siteSettings.iconUrl)} /> : null}
      </head>
      <body className="min-h-full">
        <FrontendNoCache />
        <PwaRegistration />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
