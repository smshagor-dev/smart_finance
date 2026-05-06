"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-provider";
import { useLiveUpdateListener } from "@/lib/live-client";
import { cn, formatDate } from "@/lib/utils";

const typeStyles = {
  budget: "bg-amber-500/15 text-amber-700",
  bill: "bg-blue-500/15 text-blue-700",
  balance: "bg-red-500/15 text-red-700",
  savings: "bg-emerald-500/15 text-emerald-700",
  insight: "bg-violet-500/15 text-violet-700",
  system: "bg-slate-500/15 text-slate-700",
};

export function AlertsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  const panelRef = useRef(null);
  const toast = useToast();
  const router = useRouter();

  const unreadCount = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications]);

  async function loadNotifications({ silent = false } = {}) {
    if (!silent) {
      setLoading(true);
    }

    const response = await fetch("/api/notifications?page=1&pageSize=6&sort=newest");
    const data = await response.json();
    setNotifications(data.items || []);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;

    fetch("/api/notifications?page=1&pageSize=6&sort=newest")
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) {
          setNotifications(data.items || []);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleClickOutside(event) {
      if (!panelRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useLiveUpdateListener(["notifications"], () => {
    loadNotifications({ silent: true });
  });

  async function markAsRead(notification) {
    if (notification.isRead) {
      if (notification.actionUrl) {
        router.push(notification.actionUrl);
      }
      setOpen(false);
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

  return (
    <div className="relative" ref={panelRef}>
      <Button variant="secondary" className="relative gap-2" onClick={() => setOpen((value) => !value)}>
        <Bell className="h-4 w-4" />
        Alerts
        {unreadCount ? (
          <span className="absolute -top-2 -right-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </Button>

      {open ? (
        <div className="absolute right-0 z-40 mt-3 w-[22rem] rounded-3xl border border-border bg-white p-4 shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">Alerts</h3>
              <p className="text-xs text-slate-500">Recent reminders and finance notices</p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-medium text-primary transition hover:bg-muted disabled:opacity-50"
              onClick={markAllAsRead}
              disabled={markingAll}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {markingAll ? "Saving..." : "Mark all"}
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="animate-pulse rounded-2xl bg-muted p-4">
                    <div className="h-3 w-24 rounded bg-slate-200" />
                    <div className="mt-3 h-3 w-full rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-28 rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : notifications.length ? (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={cn(
                    "block w-full rounded-2xl border px-4 py-3 text-left transition hover:bg-muted",
                    notification.isRead ? "border-border bg-white" : "border-primary/20 bg-primary/5",
                  )}
                  onClick={() => markAsRead(notification)}
                  disabled={busyId === notification.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn("rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.15em]", typeStyles[notification.type] || typeStyles.system)}>
                          {notification.type}
                        </span>
                        {!notification.isRead ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
                      </div>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{notification.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">{notification.message}</p>
                      <p className="mt-2 text-[11px] text-slate-400">{formatDate(notification.createdAt)}</p>
                    </div>
                    {notification.actionUrl ? <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-slate-400" /> : null}
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center">
                <p className="text-sm font-medium">No alerts yet</p>
                <p className="mt-1 text-xs text-slate-500">Budget reminders, low balance warnings, and system notices will appear here.</p>
              </div>
            )}
          </div>

          <div className="mt-4 border-t border-border pt-3">
            <Link href="/dashboard/notifications" className="inline-flex items-center gap-2 text-sm font-medium text-primary" onClick={() => setOpen(false)}>
              View all notifications
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
