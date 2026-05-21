"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, LoaderCircle, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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

export function AuthOnboardingGate({ user }) {
  const router = useRouter();
  const [profile, setProfile] = useState(() => user);
  const [email, setEmail] = useState(user?.email || "");
  const [emailCode, setEmailCode] = useState("");
  const [emailInfo, setEmailInfo] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailVerifyStep, setEmailVerifyStep] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState("");
  const [currencies, setCurrencies] = useState([]);
  const [currencyPage, setCurrencyPage] = useState(1);
  const [currencyHasMore, setCurrencyHasMore] = useState(false);
  const [currencyLoading, setCurrencyLoading] = useState(false);
  const [currencyError, setCurrencyError] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState(user?.defaultCurrencyId || "");
  const [savingCurrency, setSavingCurrency] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const sentinelRef = useRef(null);
  const deferredCurrencySearch = useDeferredValue(currencySearch);

  const onboarding = profile?.onboarding || { required: false, emailRequired: false, defaultCurrencyRequired: false };
  const step = onboarding.emailRequired ? "email" : onboarding.defaultCurrencyRequired ? "currency" : "";

  useEffect(() => {
    setProfile(user);
    setEmail(user?.email || "");
    setSelectedCurrency(user?.defaultCurrencyId || "");
  }, [user]);

  const selectedCurrencyOption = useMemo(
    () => currencies.find((currency) => currency.id === selectedCurrency),
    [currencies, selectedCurrency],
  );

  useEffect(() => {
    if (step !== "currency") {
      return;
    }

    let cancelled = false;

    async function load(page, reset = false) {
      setCurrencyLoading(true);
      setCurrencyError("");

      const response = await fetch(`/api/currencies?page=${page}&limit=20&search=${encodeURIComponent(deferredCurrencySearch)}`, {
        cache: "no-store",
      });
      const data = await readJson(response);

      if (cancelled) {
        return;
      }

      if (!response.ok) {
        setCurrencyError(data.error || "Could not load currencies");
        setCurrencyLoading(false);
        return;
      }

      setCurrencies((current) => (reset ? data.items || [] : [...current, ...(data.items || [])]));
      if (reset) {
        setCurrencyPage(1);
        setActiveIndex(0);
      }
      setCurrencyHasMore(Boolean(data.pagination?.hasMore));
      setCurrencyLoading(false);
    }
    load(1, true);

    return () => {
      cancelled = true;
    };
  }, [deferredCurrencySearch, step]);

  useEffect(() => {
    if (!currencyOpen || !currencyHasMore || currencyLoading) {
      return;
    }

    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (!entry?.isIntersecting) {
        return;
      }

      const nextPage = currencyPage + 1;
      setCurrencyPage(nextPage);
      setCurrencyLoading(true);
      fetch(`/api/currencies?page=${nextPage}&limit=20&search=${encodeURIComponent(deferredCurrencySearch)}`, {
        cache: "no-store",
      })
        .then(readJson)
        .then((data) => {
          setCurrencies((current) => [...current, ...(data.items || [])]);
          setCurrencyHasMore(Boolean(data.pagination?.hasMore));
          setCurrencyLoading(false);
        })
        .catch(() => {
          setCurrencyLoading(false);
          setCurrencyError("Could not load more currencies");
        });
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [currencyHasMore, currencyLoading, currencyOpen, currencyPage, deferredCurrencySearch]);

  function handleCurrencyKeyDown(event) {
    if (!currencies.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, currencies.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const option = currencies[activeIndex];
      if (option) {
        setSelectedCurrency(option.id);
        setCurrencyOpen(false);
      }
    }
  }

  async function refreshProfile() {
    router.refresh();
  }

  async function handleEmailSubmit(event) {
    event.preventDefault();
    setEmailLoading(true);
    setEmailError("");
    setEmailInfo("");

    const endpoint = emailVerifyStep ? "/api/auth/complete-email/verify" : "/api/auth/complete-email";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailVerifyStep ? { email, code: emailCode } : { email }),
    });
    const data = await readJson(response);
    setEmailLoading(false);

    if (!response.ok) {
      setEmailError(data.error || "Could not save email");
      return;
    }

    if (data.requiresVerification) {
      setEmailVerifyStep(true);
      if (data.devVerificationCode) {
        setEmailCode(data.devVerificationCode);
      }
      setEmailInfo(data.message || "Verification code sent.");
      return;
    }

    setProfile((current) => ({
      ...current,
      email,
      onboarding: {
        ...(current?.onboarding || {}),
        emailRequired: false,
        required: Boolean(current?.onboarding?.defaultCurrencyRequired),
      },
    }));
    await refreshProfile();
  }

  async function handleCurrencySubmit(event) {
    event.preventDefault();
    if (!selectedCurrency) {
      setCurrencyError("Please choose a default currency");
      return;
    }

    setSavingCurrency(true);
    setCurrencyError("");
    const response = await fetch("/api/users/me/default-currency", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defaultCurrencyId: selectedCurrency }),
    });
    const data = await readJson(response);
    setSavingCurrency(false);

    if (!response.ok) {
      setCurrencyError(data.error || "Could not save your currency");
      return;
    }

    setProfile((current) => ({
      ...current,
      defaultCurrencyId: selectedCurrency,
      onboarding: {
        ...(current?.onboarding || {}),
        defaultCurrencyRequired: false,
        required: false,
      },
    }));
    setCurrencyOpen(false);
    await refreshProfile();
  }

  if (!onboarding.required) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center">
        <div className="flex max-h-[calc(100vh-3rem)] w-full max-w-xl flex-col rounded-[2rem] border border-[#0F7A3A]/12 bg-white shadow-[0_24px_90px_rgba(7,92,43,0.18)]">
          <div className="shrink-0 rounded-t-[2rem] bg-[linear-gradient(160deg,#108A45_0%,#0F7A3A_52%,#075C2B_100%)] px-6 py-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/75">Onboarding</p>
            <h2 className="mt-3 text-[1.8rem] font-semibold leading-tight">
              {step === "email" ? "Complete your email before continuing" : "Choose your default currency"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/80">
              {step === "email"
                ? "We need a valid email on your account before dashboard access is unlocked."
                : "Your reports, balances, and finance summaries need a default currency to stay consistent."}
            </p>
          </div>

          <div className="overflow-y-auto px-6 py-6">
            {step === "email" ? (
              <form className="space-y-4" onSubmit={handleEmailSubmit}>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">Email address</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="min-h-14 w-full rounded-2xl border border-[#0F7A3A]/16 bg-[#BFE7D6]/20 px-4 text-sm text-slate-900 outline-none transition focus:border-[#0F7A3A] focus:bg-white"
                    placeholder="you@example.com"
                    disabled={emailLoading}
                    required
                  />
                </label>

                {emailVerifyStep ? (
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-800">Verification code</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={emailCode}
                      onChange={(event) => setEmailCode(event.target.value)}
                      className="min-h-14 w-full rounded-2xl border border-[#0F7A3A]/16 bg-[#BFE7D6]/20 px-4 text-sm text-slate-900 outline-none transition focus:border-[#0F7A3A] focus:bg-white"
                      placeholder="Enter 6-digit code"
                      disabled={emailLoading}
                      required
                    />
                  </label>
                ) : null}

                {emailInfo ? <p className="rounded-2xl bg-[#BFE7D6]/36 px-4 py-3 text-sm text-[#075C2B]">{emailInfo}</p> : null}
                {emailError ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{emailError}</p> : null}

                <Button
                  type="submit"
                  className="min-h-14 w-full rounded-2xl bg-[linear-gradient(135deg,#16924B_0%,#0F7A3A_42%,#075C2B_100%)] text-white shadow-[0_14px_34px_rgba(7,92,43,0.18)] hover:opacity-95"
                  disabled={emailLoading}
                >
                  {emailLoading ? "Please wait..." : emailVerifyStep ? "Verify and continue" : "Save email"}
                </Button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleCurrencySubmit}>
                <div>
                  <span className="mb-2 block text-sm font-medium text-slate-800">Default currency</span>
                  <button
                    type="button"
                    className="flex min-h-14 w-full items-center justify-between rounded-2xl border border-[#0F7A3A]/16 bg-[#BFE7D6]/20 px-4 text-left outline-none transition focus:border-[#0F7A3A] focus:bg-white"
                    onClick={() => setCurrencyOpen((current) => !current)}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {selectedCurrencyOption ? `${selectedCurrencyOption.code} - ${selectedCurrencyOption.name || selectedCurrencyOption.code}` : "Search and choose your default currency"}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {selectedCurrencyOption?.symbol || "Type code, name, or symbol"}
                      </p>
                    </div>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition ${currencyOpen ? "rotate-180" : ""}`} />
                  </button>

                  {currencyOpen ? (
                    <div className="mt-2 w-full rounded-[1.6rem] border border-[#0F7A3A]/14 bg-white p-3 shadow-[0_18px_45px_rgba(7,92,43,0.16)]">
                      <div className="mb-3 flex items-center gap-2 rounded-2xl border border-[#0F7A3A]/14 bg-[#BFE7D6]/20 px-3 py-3">
                        <Search className="h-4 w-4 text-[#075C2B]" />
                        <input
                          value={currencySearch}
                          onChange={(event) => setCurrencySearch(event.target.value)}
                          onKeyDown={handleCurrencyKeyDown}
                          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
                          placeholder="Search currency by code, name, or symbol"
                          autoFocus
                        />
                      </div>

                      <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
                        {currencies.length ? (
                          currencies.map((currency, index) => (
                            <button
                              key={currency.id}
                              type="button"
                              className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left transition ${
                                index === activeIndex ? "bg-[#BFE7D6]/35" : "hover:bg-[#BFE7D6]/28"
                              }`}
                              onMouseEnter={() => setActiveIndex(index)}
                              onClick={() => {
                                setSelectedCurrency(currency.id);
                                setCurrencyOpen(false);
                              }}
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-900">{currency.code}</p>
                                <p className="truncate text-xs text-slate-500">{currency.name || currency.code}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-500">{currency.symbol || currency.code}</span>
                                {selectedCurrency === currency.id ? <Check className="h-4 w-4 text-[#0F7A3A]" /> : null}
                              </div>
                            </button>
                          ))
                        ) : currencyLoading ? (
                          <div className="flex items-center gap-2 px-3 py-3 text-sm text-slate-500">
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            Loading currencies...
                          </div>
                        ) : (
                          <p className="px-3 py-3 text-sm text-slate-500">No active currencies found.</p>
                        )}
                        <div ref={sentinelRef} className="h-2 w-full" />
                      </div>
                    </div>
                  ) : null}
                </div>

                {currencyError ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{currencyError}</p> : null}

                <Button
                  type="submit"
                  className="min-h-14 w-full rounded-2xl bg-[linear-gradient(135deg,#16924B_0%,#0F7A3A_42%,#075C2B_100%)] text-white shadow-[0_14px_34px_rgba(7,92,43,0.18)] hover:opacity-95"
                  disabled={savingCurrency}
                >
                  {savingCurrency ? "Saving..." : "Save currency and continue"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
