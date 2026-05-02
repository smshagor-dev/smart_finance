"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Upload, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLiveUpdateListener } from "@/lib/live-client";
import { formatDate } from "@/lib/utils";

export function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  function applyProfile(data) {
    setProfile(data);
    setForm({
      name: data.name || "",
      email: data.email || "",
      image: data.image || "",
      currentPassword: "",
      password: "",
    });
  }

  async function loadProfile() {
    const response = await fetch("/api/profile");
    const data = await response.json();
    applyProfile(data);
  }

  useEffect(() => {
    let cancelled = false;

    fetch("/api/profile")
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) {
          applyProfile(data);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useLiveUpdateListener(["profile", "currencies"], () => {
    loadProfile();
  });

  if (!profile || !form) {
    return <div className="animate-pulse rounded-3xl bg-muted p-16" />;
  }

  async function handleSave(event) {
    event.preventDefault();
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || "Could not update profile");
      return;
    }

    toast.success(data.message || "Profile updated");
    await loadProfile();
    setForm((current) => ({ ...current, currentPassword: "", password: "" }));
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setIsUploadingImage(true);

    try {
      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Image upload failed");
        return;
      }

      setForm((current) => ({ ...current, image: data.fileUrl }));
      setProfile((current) => (current ? { ...current, image: data.fileUrl } : current));
      toast.success("Profile image uploaded");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  }

  async function handleVerifyPendingEmail() {
    const targetEmail = profile.pendingEmail || form.email;
    const response = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: targetEmail, code: verificationCode }),
    });
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || "Verification failed");
      return;
    }

    toast.success(data.message || "Email updated");
    setVerificationCode("");
    await loadProfile();
  }

  async function handleResendPendingEmail() {
    const response = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: profile.email,
        purpose: "email-change",
        pendingEmail: profile.pendingEmail,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || "Could not resend code");
      return;
    }

    toast.success(data.message || "Verification code resent");
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Profile</h2>
            <p className="mt-1 text-sm text-slate-500">Manage your full account information, security settings, and profile image.</p>
          </div>
          <div className="grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
            <div>Role: <span className="font-medium capitalize text-slate-900">{profile.role}</span></div>
            <div>Email status: <span className="font-medium text-slate-900">{profile.emailVerified ? "Verified" : "Pending"}</span></div>
            <div>Created: <span className="font-medium text-slate-900">{formatDate(profile.createdAt)}</span></div>
            <div>Updated: <span className="font-medium text-slate-900">{formatDate(profile.updatedAt)}</span></div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSave}>
          <div className="md:col-span-2">
            <span className="mb-3 block text-sm font-medium">Profile image</span>
            <div className="flex flex-col gap-4 rounded-3xl border border-border bg-slate-50/80 p-4 sm:flex-row sm:items-center">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-white ring-1 ring-border">
                {form.image ? (
                  <Image src={form.image} alt={form.name || "Profile image"} fill className="object-cover" />
                ) : (
                  <UserRound className="h-10 w-10 text-slate-400" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm text-slate-600">Upload a square JPG, PNG, WEBP, or GIF image up to 5MB. The uploaded image will be saved when you save the profile.</p>
                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
                    <Upload className="h-4 w-4" />
                    {isUploadingImage ? "Uploading..." : "Upload image"}
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
                  </label>
                  {form.image ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setForm((current) => ({ ...current, image: "" }));
                        setProfile((current) => (current ? { ...current, image: "" } : current));
                      }}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Remove image
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <label>
            <span className="mb-2 block text-sm font-medium">Full name</span>
            <input
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium">Email</span>
            <input
              type="email"
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium">Current password</span>
            <div className="flex items-center rounded-2xl border border-border bg-white px-4">
              <input
                type={showCurrentPassword ? "text" : "password"}
                className="w-full bg-transparent py-3 outline-none"
                value={form.currentPassword}
                onChange={(event) => setForm((current) => ({ ...current, currentPassword: event.target.value }))}
                placeholder="Required for email or password change"
              />
              <button type="button" className="text-slate-500" onClick={() => setShowCurrentPassword((value) => !value)}>
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium">New password</span>
            <div className="flex items-center rounded-2xl border border-border bg-white px-4">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full bg-transparent py-3 outline-none"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Leave blank if you do not want to change your password"
              />
              <button type="button" className="text-slate-500" onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <div className="md:col-span-2">
            <Button type="submit">Save profile</Button>
          </div>
        </form>
      </Card>

      {profile.pendingEmail ? (
        <Card className="p-6">
          <h3 className="text-xl font-semibold">Verify new email</h3>
          <p className="mt-1 text-sm text-slate-500">We sent a verification code to <span className="font-medium text-slate-900">{profile.pendingEmail}</span>. Your current login email stays unchanged until verification is complete.</p>

          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_auto]">
            <input
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
              placeholder="Enter 6-digit verification code"
              value={verificationCode}
              onChange={(event) => setVerificationCode(event.target.value)}
            />
            <Button onClick={handleVerifyPendingEmail}>Verify email</Button>
            <Button variant="secondary" onClick={handleResendPendingEmail}>
              Resend code
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
