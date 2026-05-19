"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, ChevronDown, Eye, EyeOff, LoaderCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginWithCredentials, startProviderAuth } from "@/lib/client-auth";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="#4285F4"
        d="M21.64 12.2c0-.7-.06-1.36-.18-2H12v3.78h5.4a4.62 4.62 0 0 1-2 3.03v2.5h3.24c1.9-1.75 3-4.33 3-7.3Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.62-2.45l-3.24-2.5c-.9.6-2.06.95-3.38.95-2.6 0-4.8-1.75-5.58-4.1H3.08v2.58A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.42 13.9A6.01 6.01 0 0 1 6.1 12c0-.66.11-1.3.31-1.9V7.52H3.08A10 10 0 0 0 2 12c0 1.6.38 3.1 1.08 4.48l3.34-2.58Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.98c1.46 0 2.76.5 3.8 1.48l2.84-2.84C16.95 3.05 14.69 2 12 2A10 10 0 0 0 3.08 7.52L6.42 10.1c.78-2.35 2.98-4.12 5.58-4.12Z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M13.7 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.5 1.6-1.5H17V3.7c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.4v1.8H7.5V13h2.8v8h3.4Z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M21.4 4.6a1.4 1.4 0 0 0-1.5-.2L3.2 10.9c-.7.3-.7 1.3.1 1.5l4.2 1.3 1.6 5.1c.2.7 1.1.9 1.5.3l2.3-3 4.1 3a1.4 1.4 0 0 0 2.2-.8L21.5 6a1.4 1.4 0 0 0-.1-1.4Zm-3 2.5-7.5 6.8a.7.7 0 0 0-.2.3l-.9 3.2-.9-3a.7.7 0 0 0-.5-.5l-2.4-.8 12-4.9-.6 2.9Z" />
    </svg>
  );
}

function SocialButton({ provider, label, icon, available, loadingProvider, onClick }) {
  const loading = loadingProvider === provider;

  return (
    <button
      type="button"
      onClick={() => onClick(provider)}
      disabled={!available || Boolean(loadingProvider)}
      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.1rem] border transition min-[390px]:h-[3.55rem] min-[390px]:w-[3.55rem] ${
        available
          ? "border-[#0F7A3A]/16 bg-white text-[#1F2937] shadow-[0_10px_28px_rgba(7,92,43,0.06)] hover:border-[#0F7A3A]/28 hover:bg-[#F8FCFA] focus:outline-none focus:ring-2 focus:ring-[#0F7A3A]/18"
          : "cursor-not-allowed border-[#0F7A3A]/10 bg-[#BFE7D6]/12 text-[#6B7280]"
      }`}
      aria-disabled={!available || Boolean(loadingProvider)}
      aria-label={loading ? `Redirecting with ${label}` : label}
      title={label}
    >
      <span className={provider === "facebook" ? "text-[#1877F2]" : provider === "telegram" ? "text-[#229ED9]" : ""}>
        {loading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : icon}
      </span>
    </button>
  );
}

async function readJson(response) {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

export function AuthForm({ mode = "login" }) {
  const rememberedEmail =
    typeof window !== "undefined" && mode === "login"
      ? window.localStorage.getItem("finance_tracker_remembered_email") || ""
      : "";

  const router = useRouter();
  const searchParams = useSearchParams();
  const [currencies, setCurrencies] = useState([]);
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedEmail));
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currencySearch, setCurrencySearch] = useState("");
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [providerAvailability, setProviderAvailability] = useState({
    google: false,
    facebook: false,
    telegram: false,
  });
  const [providerLoading, setProviderLoading] = useState("");
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
      .then((data) => setCurrencies(data.items || []))
      .catch(() => setCurrencies([]));
  }, [mode]);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/providers", { cache: "no-store" })
      .then(readJson)
      .then((data) => {
        if (!active) return;
        const nextProviders = {
          google: false,
          facebook: false,
          telegram: false,
        };

        for (const item of data.items || []) {
          if (item.provider in nextProviders) {
            nextProviders[item.provider] = Boolean(item.isAvailable);
          }
        }

        setProviderAvailability(nextProviders);
      })
      .catch(() => {
        if (active) {
          setProviderAvailability({
            google: false,
            facebook: false,
            telegram: false,
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredCurrencies = currencies.filter((currency) => {
    const keyword = currencySearch.trim().toLowerCase();
    if (!keyword) return true;
    return `${currency.code} ${currency.name || ""}`.toLowerCase().includes(keyword);
  });

  const selectedCurrency = currencies.find((currency) => currency.id === form.defaultCurrencyId);
  const queryMessage = searchParams.get("message");
  const queryAuthError = searchParams.get("authError");
  const displayError = error || (queryAuthError || queryMessage ? queryMessage || "Authentication could not be completed" : "");
  const fieldClassName =
    "min-h-[3.35rem] w-full rounded-[1.1rem] border border-[#0F7A3A]/14 bg-[#BFE7D6]/28 px-4 py-3 text-[0.95rem] text-[#1F2937] outline-none transition placeholder:text-[#6B7280]/90 focus:border-[#0F7A3A] focus:bg-[#FFFFFF] min-[390px]:min-h-[3.5rem] min-[390px]:px-5";
  const passwordFieldClassName =
    "flex min-h-[3.35rem] items-center rounded-[1.1rem] border border-[#0F7A3A]/14 bg-[#BFE7D6]/28 px-4 transition focus-within:border-[#0F7A3A] focus-within:bg-[#FFFFFF] min-[390px]:min-h-[3.5rem] min-[390px]:px-5";

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
      const registerData = await readJson(registerResponse);
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
      const verifyData = await readJson(verifyResponse);

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
    const data = await readJson(response);
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

  function handleProviderClick(provider) {
    setError("");
    setInfo("");
    setProviderLoading(provider);
    startProviderAuth(provider, "/dashboard");
  }

  const showRegisterFields = mode === "register" && !verificationStep;

  return (
    <div className="space-y-5">
      <form
        className={`space-y-4 min-[390px]:space-y-[1.05rem] ${mode === "register" ? "rounded-[1.6rem] border border-[#0F7A3A]/10 bg-[#FFFFFF] p-0 sm:rounded-[1.75rem] sm:p-2" : ""}`}
        onSubmit={handleSubmit}
      >
        {showRegisterFields ? (
          <>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#1F2937]">Full name</span>
              <input
                className={fieldClassName}
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
                  className="flex min-h-[3.35rem] w-full items-center justify-between rounded-[1.1rem] border border-[#0F7A3A]/14 bg-[#BFE7D6]/28 px-4 py-3 text-left outline-none transition focus:border-[#0F7A3A] focus:bg-[#FFFFFF] min-[390px]:min-h-[3.5rem] min-[390px]:px-5"
                  onClick={() => setCurrencyOpen((current) => !current)}
                >
                  <div>
                    <p className="text-sm font-medium text-[#1F2937]">
                      {selectedCurrency ? `${selectedCurrency.code} - ${selectedCurrency.name || selectedCurrency.code}` : "Use onboarding currency later"}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      {selectedCurrency?.symbol ? `Symbol: ${selectedCurrency.symbol}` : "You can also choose this after signup"}
                    </p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-[#075C2B] transition ${currencyOpen ? "rotate-180" : ""}`} />
                </button>

                {currencyOpen ? (
                  <div className="absolute z-20 mt-2 w-full rounded-[1.5rem] border border-[#0F7A3A]/16 bg-[#FFFFFF] p-3 shadow-[0_18px_45px_rgba(7,92,43,0.16)]">
                    <div className="mb-3 flex items-center gap-2 rounded-[1rem] border border-[#0F7A3A]/14 bg-[#BFE7D6]/28 px-4 py-3">
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
                      <span>Choose after signup</span>
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
            className={`${fieldClassName} disabled:bg-[#BFE7D6]/20 disabled:text-[#6B7280]`}
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
            disabled={verificationStep}
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#1F2937]">Password</span>
          <div className={passwordFieldClassName}>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full bg-transparent py-3 text-[0.95rem] text-[#1F2937] outline-none placeholder:text-[#6B7280]/90 disabled:text-[#6B7280]"
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
            <div className={passwordFieldClassName}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full bg-transparent py-3 text-[0.95rem] text-[#1F2937] outline-none placeholder:text-[#6B7280]/90"
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
              className={fieldClassName}
              value={form.code}
              onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
              placeholder="Enter 6-digit code"
              required
            />
          </label>
        ) : null}

        {mode === "login" ? (
          <div className="flex items-center justify-between gap-2 pt-1 text-[0.82rem] min-[390px]:gap-3 min-[390px]:text-sm">
            <label className="flex min-w-0 items-center gap-2 whitespace-nowrap text-inherit text-[#6B7280]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#0F7A3A]/30 accent-[#0F7A3A]"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <Link href="/forgot-password" className="shrink-0 whitespace-nowrap font-semibold text-[#075C2B] transition hover:text-[#0F7A3A]">
              Forgot password?
            </Link>
          </div>
        ) : null}

        {info ? <p className="rounded-2xl bg-[#BFE7D6]/45 px-4 py-3 text-sm text-[#075C2B]">{info}</p> : null}
        {displayError ? <p className="rounded-2xl border border-[#0F7A3A]/14 bg-[#BFE7D6]/28 px-4 py-3 text-sm text-[#075C2B]">{displayError}</p> : null}

        <Button
          className="min-h-[3.4rem] w-full rounded-[1.1rem] bg-[linear-gradient(135deg,#16924B_0%,#0F7A3A_42%,#075C2B_100%)] text-[0.96rem] font-semibold text-[#FFFFFF] shadow-[0_14px_34px_rgba(7,92,43,0.2)] hover:opacity-100 min-[390px]:min-h-[3.55rem]"
          disabled={loading || Boolean(providerLoading)}
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
            className="min-h-[3.35rem] w-full rounded-[1.1rem] border-[#0F7A3A]/18 bg-[#FFFFFF] text-[#075C2B] hover:bg-[#BFE7D6]/35 min-[390px]:min-h-[3.5rem]"
            onClick={resendCode}
            disabled={loading}
          >
            Resend code
          </Button>
        ) : null}
      </form>

      {!verificationStep ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[#0F7A3A]/14" />
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6B7280]">Or continue with</p>
            <div className="h-px flex-1 bg-[#0F7A3A]/14" />
          </div>

          <div className="flex items-center justify-center gap-3">
            <SocialButton
              provider="google"
              label="Continue with Google"
              icon={<GoogleIcon />}
              available={providerAvailability.google}
              loadingProvider={providerLoading}
              onClick={handleProviderClick}
            />
            <SocialButton
              provider="facebook"
              label="Continue with Facebook"
              icon={<FacebookIcon />}
              available={providerAvailability.facebook}
              loadingProvider={providerLoading}
              onClick={handleProviderClick}
            />
            <SocialButton
              provider="telegram"
              label="Continue with Telegram"
              icon={<TelegramIcon />}
              available={providerAvailability.telegram}
              loadingProvider={providerLoading}
              onClick={handleProviderClick}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
