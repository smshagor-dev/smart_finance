import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthForm } from "@/components/dashboard/auth-form";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="grid w-full max-w-6xl overflow-hidden lg:grid-cols-[0.95fr_1.05fr]">
        <section className="bg-[linear-gradient(180deg,#102318_0%,#173122_100%)] p-10 text-white lg:p-12">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-100/70">Finance Tracker</p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight lg:text-5xl">Build your finance system with the right currency from day one.</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-emerald-50/75 lg:text-base">
            Create your account, choose a default currency with search, verify your email, and start from a clean database-backed workspace designed for real tracking.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-white/10 p-5">
              <p className="text-sm font-medium">Live Currency Ready</p>
              <p className="mt-2 text-sm text-emerald-50/70">Search and choose from synced currencies before you even enter the dashboard.</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-5">
              <p className="text-sm font-medium">Secure Onboarding</p>
              <p className="mt-2 text-sm text-emerald-50/70">Credentials signup, email verification code flow, and optional social auth in one place.</p>
            </div>
          </div>
        </section>

        <section className="bg-[#f8fbf5] p-8 lg:p-12">
          <div className="mx-auto max-w-xl">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Create Account</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">Open your finance workspace</h2>
            <p className="mt-2 text-sm text-slate-500">Professional onboarding with searchable default currency selection and verification-ready signup.</p>

            <div className="mt-8">
              <AuthForm mode="register" />
            </div>

            <p className="mt-6 text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary">
                Login
              </Link>
            </p>
          </div>
        </section>
      </Card>
    </main>
  );
}
