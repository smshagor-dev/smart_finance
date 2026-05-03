"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { isRunningStandalone } from "@/components/pwa-registration";
import { useToast } from "@/components/ui/toast-provider";

const DISMISS_KEY = "finance_tracker_pwa_prompt_dismissed";

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.sessionStorage.getItem(DISMISS_KEY) === "true";
  });
  const [installing, setInstalling] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      if (!isRunningStandalone()) {
        setDeferredPrompt(event);
      }
    }

    function handleInstalled() {
      setDeferredPrompt(null);
      setDismissed(true);
      window.sessionStorage.setItem(DISMISS_KEY, "true");
      toast.push("App installed");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, [toast]);

  async function handleInstall() {
    if (!deferredPrompt) {
      return;
    }

    setInstalling(true);
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice.catch(() => null);
    setDeferredPrompt(null);
    setInstalling(false);
  }

  function handleDismiss() {
    setDismissed(true);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(DISMISS_KEY, "true");
    }
  }

  if (dismissed || !deferredPrompt || isRunningStandalone()) {
    return null;
  }

  return (
    <Card className="mb-6 overflow-hidden border-cyan-200 bg-gradient-to-r from-cyan-50 via-white to-sky-50 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-3xl bg-cyan-600 p-3 text-white">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Install this app</h3>
            <p className="mt-1 text-sm text-slate-600">
              Add Finance Tracker to the home screen for faster access and a native app-style experience.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button className="gap-2" onClick={handleInstall} disabled={installing}>
            <Download className="h-4 w-4" />
            {installing ? "Preparing..." : "Install App"}
          </Button>
          <Button variant="ghost" className="gap-2" onClick={handleDismiss}>
            <X className="h-4 w-4" />
            Dismiss
          </Button>
        </div>
      </div>
    </Card>
  );
}
