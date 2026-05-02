"use client";

import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useToast } from "@/components/ui/toast-provider";

const emptyForm = {
  siteName: "",
  siteTagline: "",
  siteDescription: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  logoUrl: "",
  iconUrl: "",
  supportEmail: "",
  siteUrl: "",
  smtpHost: "",
  smtpPort: 587,
  smtpSecure: false,
  smtpUser: "",
  smtpPass: "",
  smtpFrom: "",
  requireEmailVerification: true,
  verificationCodeExpiryMinutes: 15,
};

export function AdminSiteSettingsPage() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");
  const toast = useToast();

  useEffect(() => {
    let active = true;

    fetch("/api/admin/site-settings")
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        setForm({
          ...emptyForm,
          ...data,
          logoUrl: data.logoUrl || "",
          iconUrl: data.iconUrl || "",
          supportEmail: data.supportEmail || "",
          siteUrl: data.siteUrl || "",
          smtpHost: data.smtpHost || "",
          smtpUser: data.smtpUser || "",
          smtpPass: data.smtpPass || "",
          smtpFrom: data.smtpFrom || "",
        });
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function uploadAsset(file, purpose) {
    const payload = new FormData();
    payload.append("file", file);
    payload.append("purpose", purpose);

    setUploading(purpose);
    const response = await fetch("/api/admin/site-assets", {
      method: "POST",
      body: payload,
    });
    const data = await response.json();
    setUploading("");

    if (!response.ok) {
      toast.push(data.error || "Upload failed", "error");
      return;
    }

    setForm((current) => ({
      ...current,
      [purpose === "logo" ? "logoUrl" : "iconUrl"]: data.fileUrl,
    }));
    toast.push(`${purpose === "logo" ? "Logo" : "Icon"} uploaded`);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    const response = await fetch("/api/admin/site-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      toast.push(data.error || "Could not save site settings", "error");
      return;
    }

    setForm((current) => ({
      ...current,
      ...data,
      logoUrl: data.logoUrl || "",
      iconUrl: data.iconUrl || "",
      supportEmail: data.supportEmail || "",
      siteUrl: data.siteUrl || "",
      smtpHost: data.smtpHost || "",
      smtpUser: data.smtpUser || "",
      smtpPass: data.smtpPass || "",
      smtpFrom: data.smtpFrom || "",
    }));
    toast.push("Site settings updated");
  }

  if (loading) {
    return <LoadingSkeleton rows={10} />;
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Card className="p-6">
        <h3 className="text-xl font-semibold">Branding and SEO</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-medium">Site name</span>
            <input className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none" value={form.siteName} onChange={(event) => setForm((current) => ({ ...current, siteName: event.target.value }))} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Tagline</span>
            <input className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none" value={form.siteTagline} onChange={(event) => setForm((current) => ({ ...current, siteTagline: event.target.value }))} />
          </label>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium">Site description</span>
            <textarea className="min-h-28 w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none" value={form.siteDescription} onChange={(event) => setForm((current) => ({ ...current, siteDescription: event.target.value }))} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">SEO title</span>
            <input className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none" value={form.seoTitle} onChange={(event) => setForm((current) => ({ ...current, seoTitle: event.target.value }))} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Support email</span>
            <input type="email" className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none" value={form.supportEmail} onChange={(event) => setForm((current) => ({ ...current, supportEmail: event.target.value }))} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Site URL</span>
            <input className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none" value={form.siteUrl} onChange={(event) => setForm((current) => ({ ...current, siteUrl: event.target.value }))} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">SEO keywords</span>
            <input className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none" value={form.seoKeywords} onChange={(event) => setForm((current) => ({ ...current, seoKeywords: event.target.value }))} />
          </label>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium">SEO description</span>
            <textarea className="min-h-28 w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none" value={form.seoDescription} onChange={(event) => setForm((current) => ({ ...current, seoDescription: event.target.value }))} />
          </label>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold">Logo and icon</h3>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {[
            { key: "logo", label: "Site logo", value: form.logoUrl },
            { key: "icon", label: "Site icon / favicon", value: form.iconUrl },
          ].map((asset) => (
            <div key={asset.key} className="rounded-3xl border border-border p-4">
              <div className="flex min-h-32 items-center justify-center rounded-3xl bg-muted p-4">
                {asset.value ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={asset.value} alt={asset.label} className="max-h-24 w-auto object-contain" />
                ) : (
                  <p className="text-sm text-slate-500">No file uploaded</p>
                )}
              </div>
              <div className="mt-4 flex flex-col gap-3">
                <input
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none"
                  value={asset.key === "logo" ? form.logoUrl : form.iconUrl}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [asset.key === "logo" ? "logoUrl" : "iconUrl"]: event.target.value,
                    }))
                  }
                  placeholder="Uploaded file path or public URL"
                />
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-medium transition hover:bg-muted">
                  <Upload className="h-4 w-4" />
                  {uploading === asset.key ? "Uploading..." : `Upload ${asset.key}`}
                  <input
                    type="file"
                    accept="image/*,.svg,.ico"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        uploadAsset(file, asset.key);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold">SMTP delivery</h3>
        <p className="mt-2 text-sm text-slate-500">These values override environment SMTP when provided.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-medium">SMTP host</span>
            <input className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none" value={form.smtpHost} onChange={(event) => setForm((current) => ({ ...current, smtpHost: event.target.value }))} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">SMTP port</span>
            <input type="number" className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none" value={form.smtpPort} onChange={(event) => setForm((current) => ({ ...current, smtpPort: Number(event.target.value) || 587 }))} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">SMTP user</span>
            <input className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none" value={form.smtpUser} onChange={(event) => setForm((current) => ({ ...current, smtpUser: event.target.value }))} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">SMTP from</span>
            <input className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none" value={form.smtpFrom} onChange={(event) => setForm((current) => ({ ...current, smtpFrom: event.target.value }))} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">SMTP password</span>
            <input type="password" className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none" value={form.smtpPass} onChange={(event) => setForm((current) => ({ ...current, smtpPass: event.target.value }))} />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3">
            <input type="checkbox" checked={form.smtpSecure} onChange={(event) => setForm((current) => ({ ...current, smtpSecure: event.target.checked }))} />
            <span className="text-sm font-medium">Use secure SMTP connection</span>
          </label>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold">User verification policy</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3">
            <input
              type="checkbox"
              checked={form.requireEmailVerification}
              onChange={(event) => setForm((current) => ({ ...current, requireEmailVerification: event.target.checked }))}
            />
            <span className="text-sm font-medium">Require email verification for credentials login</span>
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Verification code expiry (minutes)</span>
            <input
              type="number"
              min={5}
              max={60}
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
              value={form.verificationCodeExpiryMinutes}
              onChange={(event) => setForm((current) => ({ ...current, verificationCodeExpiryMinutes: Number(event.target.value) || 15 }))}
            />
          </label>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" className="min-w-40" disabled={saving}>
          {saving ? "Saving..." : "Save site settings"}
        </Button>
      </div>
    </form>
  );
}
