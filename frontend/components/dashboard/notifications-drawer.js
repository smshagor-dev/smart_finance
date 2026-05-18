"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, ExternalLink, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-provider";
import { useLiveUpdateListener } from "@/lib/live-client";
import { cn, formatDateTime, formatRelativeTime } from "@/lib/utils";

const typeStyles = {
  budget: "bg-amber-500/15 text-amber-700",
  bill: "bg-blue-500/15 text-blue-700",
  balance: "bg-red-500/15 text-red-700",
  savings: "bg-emerald-500/15 text-emerald-700",
  insight: "bg-violet-500/15 text-violet-700",
  system: "bg-slate-500/15 text-slate-700",
};

const typeLabels = {
  budget: "Budget Alert",
  bill: "Bill Reminder",
  balance: "Balance Update",
  savings: "Savings Update",
  insight: "AI Insight",
  system: "System Notice",
};

export function NotificationsDrawer() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const unreadCount = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications]);

  async function loadNotifications({ silent = false } = {}) {
    if (!silent) {
      setLoading(true);
    }

    const response = await fetch("/api/notifications?page=1&pageSize=12&sort=newest");
    const data = await response.json();
    setNotifications(data.items || []);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;

    fetch("/api/notifications?page=1&pageSize=12&sort=newest")
      .then((response) => response.json())
      .then((data) => {
        if (active) {
          setNotifications(data.items || []);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleOpen() {
      setMounted(true);
      loadNotifications({ silent: true });
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setOpen(true);
        });
      });
    }

    window.addEventListener("dashboard-notifications-open", handleOpen);
    return () => {
      window.removeEventListener("dashboard-notifications-open", handleOpen);
    };
  }, []);

  useEffect(() => {
    if (!mounted) {
      return undefined;
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mounted]);

  useLiveUpdateListener(["notifications"], () => {
    loadNotifications({ silent: true });
  });

  async function markAsRead(notification) {
    if (notification.isRead) {
      if (notification.actionUrl) {
        router.push(notification.actionUrl);
        setOpen(false);
      }
      return;
    }

    setBusyId(notification.id);
    const response = await fetch(`/api/notifications/${notification.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: notification.title,
        message: notification.message,
        type: notification.type,
        actionUrl: notification.actionUrl || "",
        isRead: true,
      }),
    });
    const data = await response.json();
    setBusyId("");

    if (!response.ok) {
      toast.push(data.error || "Could not update alert", "error");
      return;
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      setOpen(false);
    } else {
      loadNotifications({ silent: true });
    }
  }

  async function markAllAsRead() {
    setMarkingAll(true);
    const response = await fetch("/api/notifications/read-all", {
      method: "POST",
    });
    const data = await response.json();
    setMarkingAll(false);

    if (!response.ok) {
      toast.push(data.error || "Could not mark alerts as read", "error");
      return;
    }

    toast.push(data.updatedCount ? "All alerts marked as read" : "No unread alerts");
    loadNotifications({ silent: true });
  }

  function closeDrawer() {
    setOpen(false);
    window.setTimeout(() => {
      setMounted(false);
    }, 260);
  }

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className={cn("absolute inset-0 bg-slate-950/45 backdrop-blur-[2px] transition duration-300", open ? "opacity-100" : "opacity-0")}
        aria-label="Close notifications drawer"
        onClick={closeDrawer}
      />

      <aside
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-border bg-background shadow-2xl transition duration-300 ease-out",
          open ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground sm:text-lg">Notifications</h3>
                <p className="text-xs text-slate-500 sm:text-sm">Recent reminders, alerts, and system updates</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-2xl border border-border bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-muted disabled:opacity-50 dark:bg-slate-900 dark:text-slate-200"
              onClick={markAllAsRead}
              disabled={markingAll}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {markingAll ? "Saving..." : "Mark all"}
            </button>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-white text-slate-700 shadow-sm transition hover:bg-muted dark:bg-slate-900 dark:text-slate-200"
              onClick={closeDrawer}
              aria-label="Close notifications drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-border px-5 py-3 text-sm sm:px-6">
          <p className="text-slate-500">
            {unreadCount ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "Everything is up to date"}
          </p>
          <Link href="/dashboard/notifications" className="inline-flex items-center gap-2 font-medium text-primary" onClick={closeDrawer}>
            View full page
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-3xl border border-border bg-muted/60 p-4">
                  <div className="h-3 w-24 rounded bg-slate-200" />
                  <div className="mt-3 h-4 w-2/3 rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-full rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-28 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : notifications.length ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={cn(
                    "block w-full rounded-3xl border px-4 py-4 text-left transition hover:bg-muted",
                    notification.isRead ? "border-border bg-card" : "border-primary/20 bg-primary/5",
                  )}
                  onClick={() => markAsRead(notification)}
                  disabled={busyId === notification.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.15em]", typeStyles[notification.type] || typeStyles.system)}>
                          {typeLabels[notification.type] || "Notification"}
                        </span>
                        {!notification.isRead ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
                      </div>
                      <p className="mt-3 text-sm font-semibold text-foreground sm:text-base">{notification.title}</p>
                      <p className="mt-1.5 text-sm text-slate-500">{notification.message}</p>
                      <p className="mt-3 text-xs text-slate-400">
                        {formatRelativeTime(notification.createdAt)} · {formatDateTime(notification.createdAt)}
                      </p>
                    </div>
                    {notification.actionUrl ? <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-slate-400" /> : null}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex h-full min-h-[16rem] items-center justify-center">
              <div className="w-full rounded-[2rem] border border-dashed border-border bg-muted/40 p-8 text-center">
                <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                  <Bell className="h-6 w-6" />
                </div>
                <p className="mt-4 text-base font-semibold text-foreground">No notifications yet</p>
                <p className="mt-2 text-sm text-slate-500">Budget reminders, low balance warnings, and system notices will appear here.</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
