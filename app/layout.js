import { cookies } from "next/headers";
import "./globals.css";
import { getPublicSiteSettings } from "@/lib/site-settings";

export async function generateMetadata() {
  const siteSettings = await getPublicSiteSettings();
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
    metadataBase: new URL(siteSettings.siteUrl || process.env.NEXTAUTH_URL || "http://localhost:3000"),
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
  const siteSettings = await getPublicSiteSettings();

  return (
    <html lang="en" className="h-full antialiased" data-theme={theme} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript(theme) }} />
        {siteSettings.iconUrl ? <link rel="icon" href={siteSettings.iconUrl} /> : null}
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
