"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/toast-provider";
import { useLiveUpdateListener } from "@/lib/live-client";

async function fetchLatestNotification() {
  const response = await fetch("/api/notifications?page=1&pageSize=1&sort=newest", { cache: "no-store" });
  const data = await response.json();
  return data.items?.[0] || null;
}

export function NotificationRealtimeListener() {
  const toast = useToast();
  const latestIdRef = useRef("");
  const readyRef = useRef(false);

  useEffect(() => {
    let active = true;

    fetchLatestNotification().then((notification) => {
      if (active) {
        latestIdRef.current = notification?.id || "";
        readyRef.current = true;
      }
    });

    return () => {
      active = false;
    };
  }, []);

  useLiveUpdateListener(["notifications"], async (event) => {
    if (!readyRef.current || event.action !== "created") {
      return;
    }

    const notification = await fetchLatestNotification();
    if (!notification || notification.id === latestIdRef.current) {
      return;
    }

    latestIdRef.current = notification.id;
    toast.push(notification.title || "New notification received");
  });

  return null;
}
