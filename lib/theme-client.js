"use client";

export const THEME_COOKIE_KEY = "finance_tracker_theme";
export const THEME_STORAGE_KEY = "finance_tracker_theme";
export const SUPPORTED_THEMES = ["light", "dark"];

export function isSupportedTheme(theme) {
  return SUPPORTED_THEMES.includes(theme);
}

export function applyTheme(theme) {
  const nextTheme = isSupportedTheme(theme) ? theme : "light";

  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    document.cookie = `${THEME_COOKIE_KEY}=${nextTheme}; path=/; max-age=31536000; samesite=lax`;
  }

  if (typeof window !== "undefined") {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  }
}
