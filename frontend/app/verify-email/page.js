import Link from "next/link";
import { Card } from "@/components/ui/card";
import { VerifyEmailForm } from "@/components/dashboard/verify-email-form";

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-xl p-10">
        <h1 className="text-3xl font-semibold">Verify your email</h1>
        <p className="mt-2 text-sm text-slate-500">Enter your email and the 6-digit verification code to activate credentials login.</p>
        <div className="mt-8">
          <VerifyEmailForm />
        </div>
        <p className="mt-6 text-sm text-slate-500">
          Back to{" "}
          <Link href="/login" className="font-medium text-primary">
            login
          </Link>
        </p>
      </Card>
    </main>
  );
}
