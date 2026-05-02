"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LIVE_UPDATE_EVENT, eventMatchesResources } from "@/lib/live-client";

const layoutRefreshResources = ["profile", "settings", "currencies"];

export function LiveUpdatesProvider() {
  const router = useRouter();
  const refreshTimeoutRef = useRef(null);

  useEffect(() => {
    const eventSource = new EventSource("/api/live");

    eventSource.addEventListener("message", (event) => {
      try {
        const payload = JSON.parse(event.data);
        window.dispatchEvent(new CustomEvent(LIVE_UPDATE_EVENT, { detail: payload }));

        if (eventMatchesResources(payload, layoutRefreshResources)) {
          if (refreshTimeoutRef.current) {
            window.clearTimeout(refreshTimeoutRef.current);
          }

          refreshTimeoutRef.current = window.setTimeout(() => {
            router.refresh();
            refreshTimeoutRef.current = null;
          }, 200);
        }
      } catch {}
    });

    return () => {
      if (refreshTimeoutRef.current) {
        window.clearTimeout(refreshTimeoutRef.current);
      }
      eventSource.close();
    };
  }, [router]);

  return null;
}
