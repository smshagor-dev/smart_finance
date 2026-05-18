import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthForm } from "@/components/dashboard/auth-form";
import { Card } from "@/components/ui/card";
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

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_30%),linear-gradient(180deg,#f7fbf6_0%,#e9f3ee_100%)]" />
      <div className="pointer-events-none absolute right-[12%] top-[14%] h-36 w-36 rounded-[2.5rem] border border-white/50 bg-white/20 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl" />
      <div className="pointer-events-none absolute bottom-[10%] left-[8%] h-48 w-48 rounded-full bg-emerald-200/40 blur-3xl" />

      <Card className="relative grid w-full max-w-6xl overflow-hidden border-white/60 bg-white/65 shadow-[0_35px_120px_rgba(15,23,42,0.18)] backdrop-blur-2xl lg:grid-cols-[0.98fr_1.02fr]">
        <section className="relative flex items-center justify-center bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(248,251,245,0.96)_100%)] p-6 sm:p-8 lg:p-10">
          <div className="w-full max-w-xl rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Create Account</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">Join {siteName}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Professional onboarding with searchable currency selection, verification-ready signup, and a centered 3D-style layout.
              </p>
            </div>

            <div className="mt-8">
              <AuthForm mode="register" />
            </div>

            <div className="mt-6 text-sm text-slate-500">
              <p>
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-primary">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </section>

        <section className="relative hidden overflow-hidden bg-[linear-gradient(145deg,#10271f_0%,#173f33_38%,#256c57_100%)] p-8 text-white sm:p-10 lg:block lg:p-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(167,243,208,0.18),transparent_30%)]" />
          <div className="pointer-events-none absolute left-10 top-10 h-24 w-24 -rotate-12 rounded-[2rem] border border-white/20 bg-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.2)] backdrop-blur-md" />
          <div className="pointer-events-none absolute right-12 top-24 h-40 w-40 rotate-12 rounded-full border border-white/15 bg-emerald-200/10 blur-2xl" />

          <div className="relative">
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-100/70">Start Strong</p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
              {siteName}
            </h1>
            <p className="mt-4 max-w-lg text-base text-emerald-50/78 sm:text-lg">{siteTagline}</p>
            <p className="mt-6 max-w-lg text-sm leading-7 text-emerald-50/72 sm:text-base">{siteDescription}</p>
          </div>

          <div className="relative mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-[0_22px_60px_rgba(0,0,0,0.18)] backdrop-blur-md">
              <p className="text-sm font-medium text-white">Live currency ready</p>
              <p className="mt-2 text-sm leading-6 text-emerald-50/72">Search and choose your default currency before entering the dashboard.</p>
            </div>
            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-[0_22px_60px_rgba(0,0,0,0.18)] backdrop-blur-md">
              <p className="text-sm font-medium text-white">Secure onboarding</p>
              <p className="mt-2 text-sm leading-6 text-emerald-50/72">Move from registration to verification with a cleaner, more polished first-time experience.</p>
            </div>
          </div>
        </section>
      </Card>
    </main>
  );
}
