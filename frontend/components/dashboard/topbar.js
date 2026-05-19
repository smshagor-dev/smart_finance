"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRightLeft, Bell, LogOut, Moon, Plus, Search, Settings, Sun, User, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useLiveUpdateListener } from "@/lib/live-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/lib/client-auth";
import { ADMIN_PANEL_ITEMS, SIDEBAR_ITEMS } from "@/lib/constants";
import { applyTheme } from "@/lib/theme-client";
import { resolveAssetUrl } from "@/lib/uploads";

export function Topbar({ user }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [theme, setTheme] = useState("light");
  const mobileMenuRef = useRef(null);
  const desktopMenuRef = useRef(null);
  const isAdmin = user?.role === "admin";
  const inAdminPanel = pathname.startsWith("/dashboard/admin");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  async function loadUnreadCount() {
    const response = await fetch("/api/notifications?page=1&pageSize=20&sort=newest", { cache: "no-store" });
    const data = await response.json();
    setUnreadCount((data.items || []).filter((item) => !item.isRead).length);
  }

  const searchItems = useMemo(() => {
    const baseItems = isAdmin ? [...SIDEBAR_ITEMS, ...ADMIN_PANEL_ITEMS] : SIDEBAR_ITEMS;
    const uniqueItems = Array.from(new Map(baseItems.map((item) => [item.href, item])).values());
    const normalizedQuery = deferredSearchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return uniqueItems.slice(0, 8);
    }

    return uniqueItems
      .map((item) => ({
        ...item,
        score: item.label.toLowerCase().startsWith(normalizedQuery) ? 2 : item.label.toLowerCase().includes(normalizedQuery) || item.href.toLowerCase().includes(normalizedQuery) ? 1 : 0,
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
      .slice(0, 8);
  }, [deferredSearchQuery, isAdmin]);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    function handleClickOutside(event) {
      const insideMobile = mobileMenuRef.current?.contains(event.target);
      const insideDesktop = desktopMenuRef.current?.contains(event.target);
      if (!insideMobile && !insideDesktop) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!searchOpen) {
      return undefined;
    }

    function handleClickOutside(event) {
      if (!event.target.closest("[data-dashboard-search]")) {
        setSearchOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [searchOpen]);

  useEffect(() => {
    function handleMobileNav(event) {
      setMobileNavOpen(Boolean(event.detail?.open));
    }

    window.addEventListener("dashboard-mobile-nav", handleMobileNav);

    return () => {
      window.removeEventListener("dashboard-mobile-nav", handleMobileNav);
    };
  }, []);

  useEffect(() => {
    let active = true;

    fetch("/api/notifications?page=1&pageSize=20&sort=newest", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (active) {
          setUnreadCount((data.items || []).filter((item) => !item.isRead).length);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    setTheme(currentTheme);
  }, []);

  useLiveUpdateListener(["notifications"], () => {
    loadUnreadCount();
  });

  async function handleLogout() {
    await logoutUser();
    router.push("/login");
    router.refresh();
  }

  function openQuickCreate(type) {
    window.dispatchEvent(new CustomEvent("dashboard-quick-create", { detail: { type } }));
  }

  function openNotifications() {
    setMenuOpen(false);
    window.dispatchEvent(new CustomEvent("dashboard-notifications-open"));
  }

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  function navigateFromSearch(item) {
    setSearchOpen(false);
    setSearchQuery("");
    router.push(item.href);
  }

  function handleSearchSubmit(event) {
    event.preventDefault();

    if (searchItems.length) {
      navigateFromSearch(searchItems[0]);
    }
  }

  const initials =
    user?.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";
  const ThemeIcon = theme === "dark" ? Sun : Moon;
  const userImageUrl = resolveAssetUrl(user?.image);
  return (
    <header className="mb-5 flex flex-col gap-4 min-[390px]:gap-5 sm:mb-6 lg:gap-5">
      <div className="space-y-3 pt-14 min-[390px]:pt-16 lg:hidden">
        <div
          className={cn(
            "fixed top-3 left-4 right-4 z-30 grid min-h-10 grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-2 transition min-[390px]:top-4 min-[390px]:left-5 min-[390px]:right-5 min-[430px]:left-6 min-[430px]:right-6",
            mobileNavOpen && "pointer-events-none opacity-0",
          )}
        >
          <div className="relative min-w-0" data-dashboard-search>
            <form
              className="flex h-9 min-w-0 items-center gap-2 rounded-2xl border border-border bg-white/90 px-3 text-sm text-slate-500 shadow-sm backdrop-blur transition focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10"
              onSubmit={handleSearchSubmit}
            >
              <Search className="h-4 w-4 shrink-0 text-slate-500" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search pages, wallets, budgets..."
                className="w-full min-w-0 border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                aria-label="Search dashboard pages"
              />
              {searchQuery ? (
                <button
                  type="button"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-muted hover:text-slate-700"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchOpen(false);
                  }}
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </form>

            {searchOpen ? (
              <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-40 overflow-hidden rounded-3xl border border-border bg-white/95 p-2 shadow-2xl backdrop-blur">
                <div className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {deferredSearchQuery.trim() ? "Search Results" : "Quick Access"}
                </div>
                <div className="space-y-1">
                  {searchItems.length ? (
                    searchItems.map((item) => (
                      <button
                        key={item.href}
                        type="button"
                        className={cn(
                          "flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left transition hover:bg-muted",
                          pathname === item.href && "bg-primary/5",
                        )}
                        onClick={() => navigateFromSearch(item)}
                      >
                        <span className="text-sm font-medium text-slate-800">{item.label}</span>
                        <span className="text-xs text-slate-400">{item.href.replace("/dashboard", "") || "/dashboard"}</span>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-2xl bg-muted/60 px-3 py-3 text-sm text-slate-500">No matching pages found</div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-border bg-white/90 text-slate-700 shadow-sm backdrop-blur transition hover:bg-muted"
            onClick={openNotifications}
            aria-label="Open notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount ? (
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-border bg-white/90 text-slate-700 shadow-sm backdrop-blur transition hover:bg-muted"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <ThemeIcon className="h-4 w-4" />
          </button>
          <div className="relative" ref={mobileMenuRef}>
            <button
              type="button"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-border bg-white/90 shadow-sm backdrop-blur transition hover:bg-muted"
              onClick={() => setMenuOpen((current) => !current)}
              aria-label="Open profile menu"
            >
              {userImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userImageUrl} alt={user.name || "Profile image"} className="h-6.5 w-6.5 rounded-full object-cover" />
              ) : (
                <span className="inline-flex h-6.5 w-6.5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">{initials}</span>
              )}
            </button>

            {menuOpen ? (
              <div className="absolute right-0 z-40 mt-3 w-56 rounded-3xl border border-border bg-white p-2 shadow-2xl">
                <div className="border-b border-border px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>

                <div className="space-y-1 p-2">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-muted"
                    onClick={() => setMenuOpen(false)}
                  >
                    <User className="h-4 w-4 text-slate-500" />
                    Profile
                  </Link>

                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-muted"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 text-slate-500" />
                    Settings
                  </Link>

                  {isAdmin ? (
                    <Link
                      href={inAdminPanel ? "/dashboard" : "/dashboard/admin"}
                      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-muted"
                      onClick={() => setMenuOpen(false)}
                    >
                      <ArrowRightLeft className="h-4 w-4 text-slate-500" />
                      {inAdminPanel ? "Back to App" : "Admin Panel"}
                    </Link>
                  ) : null}

                  <Button variant="ghost" className="h-10 w-full justify-start gap-3 rounded-2xl px-3 text-sm text-slate-700" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 text-slate-500" />
                    Logout
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-1.5 pl-1 pr-1 min-[390px]:space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500 min-[375px]:text-[11px] min-[430px]:tracking-[0.28em]">Finance Overview</p>
          <h1 className="max-w-full overflow-hidden text-[clamp(1.7rem,5vw,1.95rem)] font-semibold leading-[1.08] text-slate-900 text-ellipsis whitespace-nowrap">
            Welcome back, {user.name}
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 min-[390px]:h-12"
            onClick={() => openQuickCreate("income")}
          >
            <Plus className="h-4 w-4" />
            Income
          </button>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-white px-4 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-muted min-[390px]:h-12"
            onClick={() => openQuickCreate("expense")}
          >
            <Plus className="h-4 w-4" />
            Expense
          </button>
        </div>
      </div>

      <div className="hidden w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 lg:grid">
        <div className="relative w-full max-w-xl min-w-0" data-dashboard-search>
          <form
            className="flex h-11 w-full min-w-0 items-center gap-2 rounded-2xl border border-border bg-white px-3.5 text-sm text-slate-500 shadow-sm transition focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 min-[390px]:h-12 min-[390px]:px-4"
            onSubmit={handleSearchSubmit}
          >
            <Search className="h-4 w-4 shrink-0 text-slate-500" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search pages, wallets, budgets..."
              className="w-full min-w-0 border-0 bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400 min-[390px]:text-sm"
              aria-label="Search dashboard pages"
            />
            {searchQuery ? (
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-muted hover:text-slate-700"
                onClick={() => {
                  setSearchQuery("");
                  setSearchOpen(false);
                }}
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </form>

          {searchOpen ? (
            <div className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-40 overflow-hidden rounded-3xl border border-border bg-white/95 p-2 shadow-2xl backdrop-blur">
              <div className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {deferredSearchQuery.trim() ? "Search Results" : "Quick Access"}
              </div>
              <div className="space-y-1">
                {searchItems.length ? (
                  searchItems.map((item) => (
                    <button
                      key={item.href}
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition hover:bg-muted",
                        pathname === item.href && "bg-primary/5",
                      )}
                      onClick={() => navigateFromSearch(item)}
                    >
                      <span className="text-sm font-medium text-slate-800">{item.label}</span>
                      <span className="text-xs text-slate-400">{item.href.replace("/dashboard", "") || "/dashboard"}</span>
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl bg-muted/60 px-3 py-3 text-sm text-slate-500">No matching pages found</div>
                )}
              </div>
            </div>
          ) : null}
        </div>
        <div className="flex items-center justify-end gap-2 min-[390px]:gap-3">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-3.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 min-[390px]:h-12 min-[390px]:px-4 lg:min-w-[132px]"
            onClick={() => openQuickCreate("income")}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden min-[375px]:inline">Income</span>
          </button>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-white px-3.5 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-muted min-[390px]:h-12 min-[390px]:px-4 lg:min-w-[132px]"
            onClick={() => openQuickCreate("expense")}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden min-[375px]:inline">Expense</span>
          </button>
          <button
            type="button"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-white text-slate-700 shadow-sm transition hover:bg-muted min-[390px]:h-12 min-[390px]:w-12"
            onClick={openNotifications}
            aria-label="Open notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount ? (
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-white text-slate-700 shadow-sm transition hover:bg-muted min-[390px]:h-12 min-[390px]:w-12"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <ThemeIcon className="h-4 w-4" />
          </button>

          <div className="relative" ref={desktopMenuRef}>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-white shadow-sm transition hover:bg-muted min-[390px]:h-12 min-[390px]:w-12"
              onClick={() => setMenuOpen((current) => !current)}
              aria-label="Open profile menu"
            >
              {userImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userImageUrl} alt={user.name || "Profile image"} className="h-7 w-7 rounded-full object-cover min-[390px]:h-8 min-[390px]:w-8" />
              ) : (
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground min-[390px]:h-8 min-[390px]:w-8">
                  {initials}
                </span>
              )}
            </button>

            {menuOpen ? (
              <div className="absolute right-0 z-40 mt-3 w-56 rounded-3xl border border-border bg-white p-2 shadow-2xl">
                <div className="border-b border-border px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>

                <div className="space-y-1 p-2">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-muted"
                    onClick={() => setMenuOpen(false)}
                  >
                    <User className="h-4 w-4 text-slate-500" />
                    Profile
                  </Link>

                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-muted"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 text-slate-500" />
                    Settings
                  </Link>

                  {isAdmin ? (
                    <Link
                      href={inAdminPanel ? "/dashboard" : "/dashboard/admin"}
                      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-muted"
                      onClick={() => setMenuOpen(false)}
                    >
                      <ArrowRightLeft className="h-4 w-4 text-slate-500" />
                      {inAdminPanel ? "Back to App" : "Admin Panel"}
                    </Link>
                  ) : null}

                  <Button variant="ghost" className="h-10 w-full justify-start gap-3 rounded-2xl px-3 text-sm text-slate-700" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 text-slate-500" />
                    Logout
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="hidden space-y-1.5 lg:block lg:max-w-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Finance Overview</p>
        <h1 className="text-3xl font-semibold leading-tight text-slate-900">Welcome back, {user.name}</h1>
      </div>
    </header>
  );
}
