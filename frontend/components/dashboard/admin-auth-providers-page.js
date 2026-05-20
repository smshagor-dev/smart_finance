"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Copy, LoaderCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useToast } from "@/components/ui/toast-provider";

const PROVIDERS = [
  {
    key: "google",
    title: "Google Settings",
    secretLabel: "Client Secret",
    scopesPlaceholder: "openid email profile",
  },
  {
    key: "facebook",
    title: "Facebook Settings",
    secretLabel: "Client Secret",
    scopesPlaceholder: "email,public_profile",
  },
  {
    key: "telegram",
    title: "Telegram Settings",
    secretLabel: "Bot Token",
    scopesPlaceholder: "",
  },
];

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

function createEmptyForm(provider) {
  return {
    provider,
    clientId: "",
    clientSecret: "",
    botToken: "",
    callbackUrl: "",
    successRedirectUrl: "",
    failureRedirectUrl: "",
    scopes: "",
    isEnabled: false,
    clientSecretMasked: "",
    botTokenMasked: "",
    recommendedCallbackUrl: "",
    hasRequiredConfig: false,
    isAvailable: false,
  };
}

export function AdminAuthProvidersPage() {
  const [forms, setForms] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingProvider, setSavingProvider] = useState("");
  const [testingProvider, setTestingProvider] = useState("");
  const toast = useToast();

  useEffect(() => {
    let active = true;

    fetch("/api/admin/auth-providers", { cache: "no-store" })
      .then(readJson)
      .then((data) => {
        if (!active) return;

        const nextForms = {};
        for (const provider of PROVIDERS) {
          const item = (data.items || []).find((entry) => entry.provider === provider.key);
          nextForms[provider.key] = item ? { ...createEmptyForm(provider.key), ...item } : createEmptyForm(provider.key);
        }
        setForms(nextForms);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function updateForm(provider, patch) {
    setForms((current) => ({
      ...current,
      [provider]: {
        ...(current[provider] || createEmptyForm(provider)),
        ...patch,
      },
    }));
  }

  async function handleSave(provider) {
    setSavingProvider(provider);
    const response = await fetch(`/api/admin/auth-providers/${provider}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(forms[provider]),
    });
    const data = await readJson(response);
    setSavingProvider("");

    if (!response.ok) {
      toast.push(data.error || "Could not save provider settings", "error");
      return;
    }

    updateForm(provider, data.item || {});
    toast.push("Provider settings updated");
  }

  async function handleTest(provider) {
    setTestingProvider(provider);
    const response = await fetch(`/api/admin/auth-providers/${provider}/test`, {
      method: "POST",
    });
    const data = await readJson(response);
    setTestingProvider("");

    if (!response.ok) {
      toast.push(data.error || "Provider test failed", "error");
      return;
    }

    toast.push(data.message || "Provider connection looks good");
  }

  async function copyText(value, label) {
    if (!value) {
      toast.push(`No ${label.toLowerCase()} available`, "error");
      return;
    }

    await navigator.clipboard.writeText(value);
    toast.push(`${label} copied`);
  }

  if (loading) {
    return <LoadingSkeleton rows={10} />;
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900 p-6 text-white">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Dynamic Provider Auth
            </div>
            <h3 className="mt-4 text-3xl font-semibold">Authentication providers</h3>
            <p className="mt-2 text-sm text-emerald-50/80">
              Manage Google, Facebook, and Telegram credentials from the database. Secrets stay encrypted at rest and only masked values come back to the admin UI.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 text-sm text-emerald-50/85">
            Use your app domain for callback URLs so OAuth cookies stay on the same host. Missing callback or redirect URLs also keeps a provider unavailable.
          </div>
        </div>
      </Card>

      <div className="grid gap-5">
        {PROVIDERS.map((providerMeta) => {
          const form = forms[providerMeta.key] || createEmptyForm(providerMeta.key);
          const secretField = providerMeta.key === "telegram" ? "botToken" : "clientSecret";
          const secretMasked = providerMeta.key === "telegram" ? form.botTokenMasked : form.clientSecretMasked;

          return (
            <Card key={providerMeta.key} className="p-5">
              <div className="flex flex-col gap-3 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{providerMeta.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Provider status:{" "}
                    <span className={form.isAvailable ? "font-semibold text-emerald-700" : "font-semibold text-amber-700"}>
                      {form.isAvailable ? "ready" : form.isEnabled ? "incomplete" : "disabled"}
                    </span>
                  </p>
                </div>
                <label className="inline-flex items-center gap-3 rounded-full border border-border px-4 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(form.isEnabled)}
                    onChange={(event) => updateForm(providerMeta.key, { isEnabled: event.target.checked })}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  Enable provider
                </label>
              </div>

              {!form.hasRequiredConfig && form.isEnabled ? (
                <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  Redirect URLs and required credentials must be filled before this provider can be used live.
                </div>
              ) : null}

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {providerMeta.key !== "telegram" ? (
                  <label>
                    <span className="mb-2 block text-sm font-medium">Client ID</span>
                    <input
                      className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                      value={form.clientId || ""}
                      onChange={(event) => updateForm(providerMeta.key, { clientId: event.target.value })}
                      placeholder="Enter provider client ID"
                    />
                  </label>
                ) : null}

                <label>
                  <span className="mb-2 block text-sm font-medium">{providerMeta.secretLabel}</span>
                  <input
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                    value={form[secretField] || ""}
                    onChange={(event) => updateForm(providerMeta.key, { [secretField]: event.target.value })}
                    placeholder={secretMasked ? `Leave blank to keep ${secretMasked}` : `Enter ${providerMeta.secretLabel.toLowerCase()}`}
                  />
                  {secretMasked ? <p className="mt-1 text-xs text-slate-500">Saved secret: {secretMasked}</p> : null}
                </label>

                <label className="md:col-span-2">
                  <span className="mb-2 block text-sm font-medium">Callback URL</span>
                  <input
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                    value={form.callbackUrl || ""}
                    onChange={(event) => updateForm(providerMeta.key, { callbackUrl: event.target.value })}
                    placeholder={form.recommendedCallbackUrl || `/api/auth/${providerMeta.key}/callback`}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Recommended: {form.recommendedCallbackUrl || `https://your-app-domain.com/api/auth/${providerMeta.key}/callback`}
                  </p>
                </label>

                <label>
                  <span className="mb-2 block text-sm font-medium">Success Redirect URL</span>
                  <input
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                    value={form.successRedirectUrl || ""}
                    onChange={(event) => updateForm(providerMeta.key, { successRedirectUrl: event.target.value })}
                    placeholder="/dashboard"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-medium">Failure Redirect URL</span>
                  <input
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                    value={form.failureRedirectUrl || ""}
                    onChange={(event) => updateForm(providerMeta.key, { failureRedirectUrl: event.target.value })}
                    placeholder="/login"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="mb-2 block text-sm font-medium">Scopes</span>
                  <input
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                    value={form.scopes || ""}
                    onChange={(event) => updateForm(providerMeta.key, { scopes: event.target.value })}
                    placeholder={providerMeta.scopesPlaceholder}
                  />
                </label>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Callback URL</p>
                      <p className="mt-2 break-all text-sm text-slate-700">{form.callbackUrl || "Not configured"}</p>
                    </div>
                    <button type="button" onClick={() => copyText(form.callbackUrl, "Callback URL")} className="rounded-xl border border-border p-2 text-slate-600 transition hover:bg-white">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Success Redirect</p>
                      <p className="mt-2 break-all text-sm text-slate-700">{form.computedSuccessRedirectUrl || form.successRedirectUrl || "Not configured"}</p>
                    </div>
                    <button type="button" onClick={() => copyText(form.computedSuccessRedirectUrl || form.successRedirectUrl, "Success redirect")} className="rounded-xl border border-border p-2 text-slate-600 transition hover:bg-white">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Failure Redirect</p>
                      <p className="mt-2 break-all text-sm text-slate-700">{form.computedFailureRedirectUrl || form.failureRedirectUrl || "Not configured"}</p>
                    </div>
                    <button type="button" onClick={() => copyText(form.computedFailureRedirectUrl || form.failureRedirectUrl, "Failure redirect")} className="rounded-xl border border-border p-2 text-slate-600 transition hover:bg-white">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button variant="secondary" className="gap-2" onClick={() => handleTest(providerMeta.key)} disabled={Boolean(testingProvider || savingProvider)}>
                  {testingProvider === providerMeta.key ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                  {testingProvider === providerMeta.key ? "Testing..." : "Test connection"}
                </Button>
                <Button className="gap-2" onClick={() => handleSave(providerMeta.key)} disabled={Boolean(testingProvider || savingProvider)}>
                  {savingProvider === providerMeta.key ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                  {savingProvider === providerMeta.key ? "Saving..." : "Save settings"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
