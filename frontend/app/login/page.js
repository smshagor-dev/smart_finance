import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthForm } from "@/components/dashboard/auth-form";
import { Card } from "@/components/ui/card";
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

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.16),transparent_30%),linear-gradient(180deg,#f7fbf6_0%,#e6f0ea_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-20 h-56 w-56 -translate-x-1/2 rounded-full bg-white/45 blur-3xl" />
      <div className="pointer-events-none absolute left-[10%] top-[18%] h-28 w-28 rounded-[2rem] border border-white/40 bg-white/20 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl" />
      <div className="pointer-events-none absolute bottom-[12%] right-[8%] h-40 w-40 rounded-full border border-emerald-200/60 bg-emerald-100/40 blur-2xl" />

      <Card className="relative grid w-full max-w-6xl overflow-hidden border-white/60 bg-white/65 shadow-[0_35px_120px_rgba(15,23,42,0.18)] backdrop-blur-2xl lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden overflow-hidden bg-[linear-gradient(145deg,#0f2d24_0%,#143c31_40%,#1d5b49_100%)] p-8 text-white sm:p-10 lg:block lg:p-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.26),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(110,231,183,0.18),transparent_28%)]" />
          <div className="pointer-events-none absolute right-8 top-10 h-28 w-28 rotate-12 rounded-[2rem] border border-white/20 bg-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.2)] backdrop-blur-md" />
          <div className="pointer-events-none absolute bottom-8 left-10 h-20 w-20 -rotate-12 rounded-full border border-white/20 bg-emerald-200/10 backdrop-blur-md" />

          <div className="relative">
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-100/70">Welcome Back</p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
              {siteName}
            </h1>
            <p className="mt-4 max-w-lg text-base text-emerald-50/78 sm:text-lg">{siteTagline}</p>
            <p className="mt-6 max-w-lg text-sm leading-7 text-emerald-50/72 sm:text-base">{siteDescription}</p>
          </div>

          <div className="relative mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-[0_22px_60px_rgba(0,0,0,0.18)] backdrop-blur-md">
              <p className="text-sm font-medium text-white">Focused workspace</p>
              <p className="mt-2 text-sm leading-6 text-emerald-50/72">A centered sign-in flow with everything important kept clean, calm, and easy to reach.</p>
            </div>
            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-[0_22px_60px_rgba(0,0,0,0.18)] backdrop-blur-md">
              <p className="text-sm font-medium text-white">Real finance control</p>
              <p className="mt-2 text-sm leading-6 text-emerald-50/72">Access budgets, receipts, reports, goals, debts, and collaboration from one secure account.</p>
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center bg-[linear-gradient(180deg,rgba(255,255,255,0.76)_0%,rgba(248,251,245,0.94)_100%)] p-6 sm:p-8 lg:p-10">
          <div className="w-full max-w-xl rounded-[2rem] border border-white/70 bg-white/78 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Account Access</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">Login to {siteName}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Secure email and password sign-in with backend-managed sessions and a cleaner centered experience.
              </p>
            </div>

            <div className="mt-8">
              <AuthForm mode="login" />
            </div>

            <div className="mt-6 text-sm text-slate-500">
              <p>
                No account yet?{" "}
                <Link href="/register" className="font-medium text-primary">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </section>
      </Card>
    </main>
  );
}
