import { redirect } from "next/navigation";
import { AuthForm } from "@/components/dashboard/auth-form";
import { AuthShell } from "@/components/dashboard/auth-shell";
import { getCurrentUser } from "@/lib/auth";
import { getPublicSiteSettings } from "@/lib/site-settings";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  let siteSettings;

  try {
    siteSettings = await getPublicSiteSettings();
  } catch {
    siteSettings = {
      siteName: "Finance Tracker",
      siteTagline: "Personal finance command center",
      siteDescription: "Track transactions, budgets, savings goals, recurring bills, debts, reports, receipts, and team finance in one place.",
    };
  }

  const siteName = siteSettings.siteName || "Finance Tracker";
  const siteTagline = siteSettings.siteTagline || "Personal finance command center";
  const siteDescription =
    siteSettings.siteDescription ||
    "Track transactions, budgets, savings goals, recurring bills, debts, reports, receipts, and team finance in one place.";
  const logoUrl = siteSettings.logoUrl || "";
  const iconUrl = siteSettings.iconUrl || "";

  return (
    <AuthShell
      mode="login"
      siteName={siteName}
      siteTagline={siteTagline}
      siteDescription={siteDescription}
      logoUrl={logoUrl}
      iconUrl={iconUrl}
    >
      <AuthForm mode="login" />
    </AuthShell>
  );
}
