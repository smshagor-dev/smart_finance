import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthForm } from "@/components/dashboard/auth-form";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="grid w-full max-w-5xl overflow-hidden lg:grid-cols-[1.2fr_0.8fr]">
        <section className="hidden bg-[#112215] p-10 text-white lg:block">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-100/70">Finance Tracker</p>
          <h1 className="mt-5 text-5xl font-semibold leading-tight">A calm, modern space to manage every part of your money.</h1>
          <p className="mt-5 max-w-lg text-emerald-50/75">
            Track transactions, budgets, savings goals, recurring bills, debts, reports, receipts, team finance, and rule-based AI insights.
          </p>
        </section>
        <section className="p-6 sm:p-8 lg:p-10">
          <div className="hidden lg:block">
            <h2 className="text-3xl font-semibold">Login</h2>
            <p className="mt-2 text-sm text-slate-500">Credentials, Google, and Facebook sign-in powered by NextAuth.</p>
          </div>
          <div className="mt-8">
            <AuthForm mode="login" />
          </div>
          <div className="hidden lg:block">
            <p className="mt-6 text-sm text-slate-500">
              No account yet?{" "}
              <Link href="/register" className="font-medium text-primary">
                Create one
              </Link>
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Need to confirm your account?{" "}
              <Link href="/verify-email" className="font-medium text-primary">
                Verify email
              </Link>
            </p>
          </div>
        </section>
      </Card>
    </main>
  );
}
