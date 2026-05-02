import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-lg p-10">
        <h1 className="text-3xl font-semibold">Forgot password</h1>
        <p className="mt-2 text-sm text-slate-500">This structure is ready for email delivery. Submit your email and the app will create a reset token record for future mail sending.</p>
        <form
          className="mt-8 space-y-4"
          action={async (formData) => {
            "use server";
            await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/forgot-password`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: formData.get("email") }),
            });
          }}
        >
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Email</span>
            <input name="email" type="email" className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none" required />
          </label>
          <Button type="submit" className="w-full">
            Prepare reset request
          </Button>
        </form>
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
