import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/lib/auth";
import { getPublicSiteSettings } from "@/lib/site-settings";

export default async function DashboardLayout({ children }) {
  const user = await requireUser();
  let siteSettings;

  try {
    siteSettings = await getPublicSiteSettings();
  } catch {
    siteSettings = {
      siteName: "Finance Tracker",
      siteTagline: "Personal finance command center",
    };
  }

  const siteName = siteSettings.siteName || "Finance Tracker";
  const siteTagline = siteSettings.siteTagline || "Personal finance command center";

  return (
    <DashboardShell user={user} siteName={siteName} siteTagline={siteTagline}>
      {children}
    </DashboardShell>
  );
}
