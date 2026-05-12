"use client";

import { useEffect } from "react";

export function FrontendNoCache() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const originalFetch = window.fetch.bind(window);

    window.fetch = (input, init = {}) => {
      const nextInit = { ...init };

      if (!nextInit.cache) {
        nextInit.cache = "no-store";
      }

      return originalFetch(input, nextInit);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
