import { redirect } from "next/navigation";
import { AuthForm } from "@/components/dashboard/auth-form";
import { AuthShell } from "@/components/dashboard/auth-shell";
import { getCurrentUser } from "@/lib/auth";
import { getPublicSiteSettings } from "@/lib/site-settings";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  let siteSettings;

  try {
    siteSettings = await getPublicSiteSettings();
  } catch {
    siteSettings = {
      siteName: "Finance Tracker",
      siteTagline: "Personal finance command center",
      siteDescription: "Create your account, choose your default currency, and start with a polished finance workspace built for daily use.",
    };
  }

  const siteName = siteSettings.siteName || "Finance Tracker";
  const siteTagline = siteSettings.siteTagline || "Personal finance command center";
  const siteDescription =
    siteSettings.siteDescription ||
    "Create your account, choose your default currency, and start with a polished finance workspace built for daily use.";
  const logoUrl = siteSettings.logoUrl || "";
  const iconUrl = siteSettings.iconUrl || "";

  return (
    <AuthShell
      mode="register"
      siteName={siteName}
      siteTagline={siteTagline}
      siteDescription={siteDescription}
      logoUrl={logoUrl}
      iconUrl={iconUrl}
    >
      <AuthForm mode="register" />
    </AuthShell>
  );
}
