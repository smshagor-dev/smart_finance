"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginWithCredentials } from "@/lib/client-auth";

export function VerifyEmailForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleVerify(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const response = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Verification failed");
      return;
    }

    const loginResult = await loginWithCredentials({
      email,
      password,
    });

    setLoading(false);
    if (!loginResult.ok) {
      setMessage("Email verified successfully. Please log in with your password.");
      return;
    }

    setMessage(data.message || "Email verified successfully");
    router.push("/dashboard");
    router.refresh();
  }

  async function handleResend() {
    setLoading(true);
    setError("");
    setMessage("");

    const response = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Could not resend code");
      return;
    }

    if (data.devVerificationCode) {
      setCode(data.devVerificationCode);
    }
    setMessage(data.message || "A new verification code has been generated");
  }

  return (
    <form className="space-y-4" onSubmit={handleVerify}>
      <label className="block">
        <span className="mb-2 block text-sm font-medium">Email</span>
        <input
          type="email"
          className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium">Verification code</span>
        <input
          type="text"
          maxLength={6}
          className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium">Password</span>
        <div className="flex items-center rounded-2xl border border-border bg-white px-4 transition focus-within:border-primary">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full bg-transparent py-3 outline-none"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your account password"
            required
          />
          <button
            type="button"
            className="text-slate-500"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </label>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button className="w-full" disabled={loading}>
        {loading ? "Please wait..." : "Verify email"}
      </Button>
      <Button type="button" variant="secondary" className="w-full" onClick={handleResend} disabled={loading || !email}>
        Resend code
      </Button>
    </form>
  );
}
