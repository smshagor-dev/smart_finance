import { cookies } from "next/headers";
import "./globals.css";
import { PwaRegistration } from "@/components/pwa-registration";
import { getPublicSiteSettings } from "@/lib/site-settings";
import { getMetadataBaseUrl } from "@/lib/app-url";

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
    };
  }

  const title = siteSettings.seoTitle || siteSettings.siteName;
  const description = siteSettings.seoDescription || siteSettings.siteDescription;
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
    icons: siteSettings.iconUrl
      ? {
          icon: siteSettings.iconUrl,
          shortcut: siteSettings.iconUrl,
          apple: siteSettings.iconUrl,
        }
      : undefined,
  };
}

function themeInitializationScript(initialTheme) {
  return `
    (function() {
      try {
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
    siteSettings = { iconUrl: null };
  }

  return (
    <html lang="en" className="h-full antialiased" data-theme={theme} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript(theme) }} />
        {siteSettings.iconUrl ? <link rel="icon" href={siteSettings.iconUrl} /> : null}
      </head>
      <body className="min-h-full">
        <PwaRegistration />
        {children}
      </body>
    </html>
  );
}
