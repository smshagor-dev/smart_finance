"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, ChevronDown, Eye, EyeOff, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginWithCredentials } from "@/lib/client-auth";

export function AuthForm({ mode = "login" }) {
  const rememberedEmail =
    typeof window !== "undefined" && mode === "login"
      ? window.localStorage.getItem("finance_tracker_remembered_email") || ""
      : "";

  const router = useRouter();
  const [currencies, setCurrencies] = useState([]);
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedEmail));
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currencySearch, setCurrencySearch] = useState("");
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: rememberedEmail,
    password: "",
    confirmPassword: "",
    defaultCurrencyId: "",
    code: "",
  });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode !== "register") return;
    fetch("/api/public/currencies")
      .then((response) => response.json())
      .then((data) => setCurrencies(data.items || []));
  }, [mode]);

  const filteredCurrencies = currencies.filter((currency) => {
    const keyword = currencySearch.trim().toLowerCase();
    if (!keyword) return true;
    return `${currency.code} ${currency.name || ""}`.toLowerCase().includes(keyword);
  });

  const selectedCurrency = currencies.find((currency) => currency.id === form.defaultCurrencyId);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    if (mode === "register" && !verificationStep) {
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const registerData = await registerResponse.json();
      setLoading(false);

      if (!registerResponse.ok) {
        setError(registerData.error || "Registration failed");
        return;
      }

      if (!registerData.requiresVerification) {
        const result = await loginWithCredentials({
          email: registerData.email || form.email,
          password: form.password,
        });

        if (!result.ok) {
          setError(result.data?.error || "Login failed");
          return;
        }

        router.push("/dashboard");
        router.refresh();
        return;
      }

      setVerificationStep(true);
      setVerificationEmail(registerData.email || form.email);
      if (registerData.devVerificationCode) {
        setForm((current) => ({ ...current, code: registerData.devVerificationCode }));
      }
      setInfo(registerData.message || "Verification code sent.");
      return;
    }

    if (mode === "register" && verificationStep) {
      const verifyResponse = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: verificationEmail || form.email,
          code: form.code,
        }),
      });
      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        setLoading(false);
        setError(verifyData.error || "Verification failed");
        return;
      }

      const result = await loginWithCredentials({
        email: verificationEmail || form.email,
        password: form.password,
      });

      setLoading(false);
      if (!result.ok) {
        setError(result.data?.error || "Login failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
      return;
    }

    const result = await loginWithCredentials({
      email: form.email,
      password: form.password,
    });

    setLoading(false);
    if (!result.ok) {
      setError(result.data?.error || "Login failed");
      return;
    }

    if (mode === "login") {
      if (rememberMe) {
        window.localStorage.setItem("finance_tracker_remembered_email", form.email);
      } else {
        window.localStorage.removeItem("finance_tracker_remembered_email");
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function resendCode() {
    setLoading(true);
    setError("");
    setInfo("");

    const response = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: verificationEmail || form.email }),
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Could not resend code");
      return;
    }

    if (data.devVerificationCode) {
      setForm((current) => ({ ...current, code: data.devVerificationCode }));
    }
    setInfo(data.message || "Verification code resent.");
  }

  const showRegisterFields = mode === "register" && !verificationStep;

  return (
    <div className="space-y-5">
      <form
        className={`space-y-4 ${mode === "register" ? "rounded-[1.75rem] border border-[#0F7A3A]/12 bg-[#FFFFFF] p-4 sm:p-5" : ""}`}
        onSubmit={handleSubmit}
      >
        {showRegisterFields ? (
          <>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#1F2937]">Full name</span>
              <input
                className="min-h-12 w-full rounded-full border border-[#0F7A3A]/16 bg-[#BFE7D6]/35 px-5 py-3 text-[#1F2937] outline-none transition placeholder:text-[#6B7280] focus:border-[#0F7A3A] focus:bg-[#FFFFFF]"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
                placeholder="Enter your full name"
              />
            </label>
            <div className="block">
              <span className="mb-2 block text-sm font-medium text-[#1F2937]">Default currency</span>
              <div className="relative">
                <button
                  type="button"
                  className="flex min-h-12 w-full items-center justify-between rounded-full border border-[#0F7A3A]/16 bg-[#BFE7D6]/35 px-5 py-3 text-left outline-none transition focus:border-[#0F7A3A] focus:bg-[#FFFFFF]"
                  onClick={() => setCurrencyOpen((current) => !current)}
                >
                  <div>
                    <p className="text-sm font-medium text-[#1F2937]">
                      {selectedCurrency ? `${selectedCurrency.code} - ${selectedCurrency.name || selectedCurrency.code}` : "Use system default (USD)"}
                    </p>
                    <p className="text-xs text-[#6B7280]">{selectedCurrency?.symbol ? `Symbol: ${selectedCurrency.symbol}` : "Live currency-aware tracking"}</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-[#075C2B] transition ${currencyOpen ? "rotate-180" : ""}`} />
                </button>

                {currencyOpen ? (
                  <div className="absolute z-20 mt-2 w-full rounded-[1.75rem] border border-[#0F7A3A]/16 bg-[#FFFFFF] p-3 shadow-[0_18px_45px_rgba(7,92,43,0.16)]">
                    <div className="mb-3 flex items-center gap-2 rounded-full border border-[#0F7A3A]/14 bg-[#BFE7D6]/35 px-4 py-3">
                      <Search className="h-4 w-4 text-[#075C2B]" />
                      <input
                        className="w-full bg-transparent text-sm text-[#1F2937] outline-none placeholder:text-[#6B7280]"
                        placeholder="Search currency by code or name"
                        value={currencySearch}
                        onChange={(event) => setCurrencySearch(event.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm text-[#1F2937] transition hover:bg-[#BFE7D6]/35"
                      onClick={() => {
                        setForm((current) => ({ ...current, defaultCurrencyId: "" }));
                        setCurrencyOpen(false);
                        setCurrencySearch("");
                      }}
                    >
                      <span>Use system default (USD)</span>
                      {!form.defaultCurrencyId ? <Check className="h-4 w-4 text-[#0F7A3A]" /> : null}
                    </button>
                    <div className="mt-2 max-h-64 space-y-1 overflow-y-auto">
                      {filteredCurrencies.length ? (
                        filteredCurrencies.map((currency) => (
                          <button
                            key={currency.id}
                            type="button"
                            className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left transition hover:bg-[#BFE7D6]/35"
                            onClick={() => {
                              setForm((current) => ({ ...current, defaultCurrencyId: currency.id }));
                              setCurrencyOpen(false);
                              setCurrencySearch("");
                            }}
                          >
                            <div>
                              <p className="text-sm font-medium text-[#1F2937]">{currency.code}</p>
                              <p className="text-xs text-[#6B7280]">{currency.name || currency.code}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-[#6B7280]">{currency.symbol || currency.code}</span>
                              {form.defaultCurrencyId === currency.id ? <Check className="h-4 w-4 text-[#0F7A3A]" /> : null}
                            </div>
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-sm text-[#6B7280]">No currencies found.</p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#1F2937]">Email</span>
          <input
            type="email"
            className="min-h-12 w-full rounded-full border border-[#0F7A3A]/16 bg-[#BFE7D6]/35 px-5 py-3 text-[#1F2937] outline-none transition placeholder:text-[#6B7280] focus:border-[#0F7A3A] focus:bg-[#FFFFFF] disabled:bg-[#BFE7D6]/20 disabled:text-[#6B7280]"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
            disabled={verificationStep}
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#1F2937]">Password</span>
          <div className="flex min-h-12 items-center rounded-full border border-[#0F7A3A]/16 bg-[#BFE7D6]/35 px-5 transition focus-within:border-[#0F7A3A] focus-within:bg-[#FFFFFF]">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full bg-transparent py-3 text-[#1F2937] outline-none placeholder:text-[#6B7280] disabled:text-[#6B7280]"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              required
              disabled={mode === "register" && verificationStep}
              placeholder={mode === "register" ? "Create a strong password" : "Enter your password"}
            />
            <button
              type="button"
              className="text-[#075C2B]"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        {showRegisterFields ? (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#1F2937]">Confirm password</span>
            <div className="flex min-h-12 items-center rounded-full border border-[#0F7A3A]/16 bg-[#BFE7D6]/35 px-5 transition focus-within:border-[#0F7A3A] focus-within:bg-[#FFFFFF]">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full bg-transparent py-3 text-[#1F2937] outline-none placeholder:text-[#6B7280]"
                value={form.confirmPassword}
                onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                required
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="text-[#075C2B]"
                onClick={() => setShowConfirmPassword((current) => !current)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>
        ) : null}

        {mode === "register" && verificationStep ? (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#1F2937]">Verification code</span>
            <input
              type="text"
              maxLength={6}
              className="min-h-12 w-full rounded-full border border-[#0F7A3A]/16 bg-[#BFE7D6]/35 px-5 py-3 text-[#1F2937] outline-none transition placeholder:text-[#6B7280] focus:border-[#0F7A3A] focus:bg-[#FFFFFF]"
              value={form.code}
              onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
              placeholder="Enter 6-digit code"
              required
            />
          </label>
        ) : null}

        {mode === "login" ? (
          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-[#6B7280]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#0F7A3A]/30 accent-[#0F7A3A]"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-sm font-semibold text-[#075C2B] transition hover:text-[#0F7A3A]">
              Forgot password?
            </Link>
          </div>
        ) : null}

        {info ? <p className="rounded-2xl bg-[#BFE7D6]/45 px-4 py-3 text-sm text-[#075C2B]">{info}</p> : null}
        {error ? <p className="rounded-2xl border border-[#0F7A3A]/14 bg-[#BFE7D6]/28 px-4 py-3 text-sm text-[#075C2B]">{error}</p> : null}

        <Button
          className="min-h-12 w-full rounded-full bg-[linear-gradient(135deg,#0F7A3A_0%,#075C2B_100%)] text-[#FFFFFF] shadow-[0_14px_34px_rgba(7,92,43,0.2)] hover:opacity-100"
          disabled={loading}
        >
          {loading
            ? "Please wait..."
            : mode === "login"
              ? "Login"
              : verificationStep
                ? "Verify Email"
                : "Create account"}
        </Button>

        {mode === "register" && verificationStep ? (
          <Button
            type="button"
            variant="secondary"
            className="min-h-12 w-full rounded-full border-[#0F7A3A]/18 bg-[#FFFFFF] text-[#075C2B] hover:bg-[#BFE7D6]/35"
            onClick={resendCode}
            disabled={loading}
          >
            Resend code
          </Button>
        ) : null}
      </form>
    </div>
  );
}
