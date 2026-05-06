"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Moon, Search, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { useLiveUpdateListener } from "@/lib/live-client";
import { applyTheme } from "@/lib/theme-client";
import { useToast } from "@/components/ui/toast-provider";

export function SettingsPage() {
  const [form, setForm] = useState(null);
  const [currencySearch, setCurrencySearch] = useState("");
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const toast = useToast();

  async function loadSettings() {
    const response = await fetch("/api/settings");
    const payload = await response.json();
    setForm(payload);
    applyTheme(payload.theme || "light");
  }

  useEffect(() => {
    let cancelled = false;

    fetch("/api/settings")
      .then((response) => response.json())
      .then((payload) => {
        if (!cancelled) {
          setForm(payload);
          applyTheme(payload.theme || "light");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useLiveUpdateListener(["settings", "currencies"], () => {
    loadSettings();
  });

  if (!form) {
    return <div className="animate-pulse rounded-3xl bg-muted p-16" />;
  }

  const filteredCurrencies = (form.currencies || []).filter((currency) => {
    const keyword = currencySearch.trim().toLowerCase();
    if (!keyword) return true;
    return `${currency.label || ""}`.toLowerCase().includes(keyword);
  });

  const selectedCurrency = (form.currencies || []).find((currency) => currency.value === form.defaultCurrencyId);

  async function handleSubmit(event) {
    event.preventDefault();
    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.push(data.error || "Settings update failed", "error");
      return;
    }

    applyTheme(form.theme);
    toast.push("Settings updated");
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold">Profile & Settings</h2>
      <p className="mt-1 text-sm text-slate-500">Manage your default currency, language, appearance, timezone, and notification preferences.</p>
      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <div>
          <span className="mb-2 block text-sm font-medium">Default Currency</span>
          <div className="relative">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-2xl border border-border bg-white px-4 py-3 text-left outline-none transition focus:border-primary"
              onClick={() => setCurrencyOpen((current) => !current)}
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{selectedCurrency?.label || "Select currency"}</p>
                <p className="text-xs text-slate-500">Choose your default finance display currency</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-500 transition ${currencyOpen ? "rotate-180" : ""}`} />
            </button>

            {currencyOpen ? (
              <div className="absolute z-20 mt-2 w-full rounded-3xl border border-border bg-white p-3 shadow-xl">
                <div className="mb-3 flex items-center gap-2 rounded-2xl border border-border bg-slate-50 px-3 py-2">
                  <Search className="h-4 w-4 text-slate-500" />
                  <input
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="Search currency by code or name"
                    value={currencySearch}
                    onChange={(event) => setCurrencySearch(event.target.value)}
                  />
                </div>
                <div className="max-h-64 space-y-1 overflow-y-auto">
                  {filteredCurrencies.length ? (
                    filteredCurrencies.map((currency) => (
                      <button
                        key={currency.value}
                        type="button"
                        className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left hover:bg-muted"
                        onClick={() => {
                          setForm((current) => ({ ...current, defaultCurrencyId: currency.value }));
                          setCurrencyOpen(false);
                          setCurrencySearch("");
                        }}
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">{currency.label.split(" - ")[0]}</p>
                          <p className="text-xs text-slate-500">{currency.label.split(" - ").slice(1).join(" - ") || currency.label}</p>
                        </div>
                        {form.defaultCurrencyId === currency.value ? <Check className="h-4 w-4 text-primary" /> : null}
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-slate-500">No currencies found.</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <span className="mb-2 block text-sm font-medium">Theme</span>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "light", label: "Light", icon: Sun, description: "Bright workspace for daytime use" },
              { value: "dark", label: "Dark", icon: Moon, description: "Low-glare workspace for darker settings" },
            ].map((option) => {
              const Icon = option.icon;
              const active = form.theme === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    active ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "border-border bg-white hover:bg-muted"
                  }`}
                  onClick={() => {
                    setForm((current) => ({ ...current, theme: option.value }));
                    applyTheme(option.value);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-2xl p-2 ${active ? "bg-primary text-primary-foreground" : "bg-muted text-slate-600"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{option.label}</p>
                      <p className="text-xs text-slate-500">{option.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <label>
          <span className="mb-2 block text-sm font-medium">Language</span>
          <select
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
            value={form.language}
            onChange={(event) => setForm((current) => ({ ...current, language: event.target.value }))}
          >
            {SUPPORTED_LANGUAGES.map((language) => (
              <option key={language.value} value={language.value}>
                {language.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium">Timezone</span>
          <input
            type="text"
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
            value={form.timezone ?? ""}
            onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value }))}
          />
        </label>

        <div className="md:col-span-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["emailNotifications", "Email notifications"],
            ["budgetAlerts", "Budget alerts"],
            ["billReminders", "Bill reminders"],
            ["lowBalanceWarnings", "Low balance warnings"],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 rounded-2xl bg-muted p-4">
              <input
                type="checkbox"
                checked={Boolean(form[key])}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.checked }))}
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>

        <div className="md:col-span-2">
          <Button type="submit">Save settings</Button>
        </div>
      </form>
    </Card>
  );
}
