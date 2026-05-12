"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, LogOut, Plus, Search, Shield } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/lib/client-auth";

export function Topbar({ user }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState("");
  const mobileMenuRef = useRef(null);
  const desktopMenuRef = useRef(null);
  const isAdmin = user?.role === "admin";
  const inAdminPanel = pathname.startsWith("/dashboard/admin");

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

  async function handleLogout() {
    await logoutUser();
    router.push("/login");
    router.refresh();
  }

  const initials =
    user?.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";

  return (
    <header className="mb-5 flex flex-col gap-4 min-[390px]:gap-5 sm:mb-6 lg:gap-5">
      <div className="space-y-3 lg:hidden">
        <div className="sticky top-3 z-20 flex min-h-11 items-center gap-2 pl-12 min-[390px]:pl-14">
          <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-2xl border border-border bg-white/90 px-3 text-sm text-slate-500 shadow-sm backdrop-blur transition focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
            <Search className="h-4 w-4 shrink-0 text-slate-500" />
            <input
              type="search"
              value={mobileSearch}
              onChange={(event) => setMobileSearch(event.target.value)}
              placeholder="Search records, budgets, wallets..."
              className="w-full min-w-0 border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              aria-label="Search records, budgets, wallets"
            />
          </label>
          <div className="relative" ref={mobileMenuRef}>
            <button
              type="button"
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl border border-border bg-white/90 px-2.5 shadow-sm backdrop-blur transition hover:bg-muted"
              onClick={() => setMenuOpen((current) => !current)}
              aria-label="Open profile menu"
            >
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt={user.name || "Profile image"} className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{initials}</span>
              )}
              <ChevronDown className={cn("h-4 w-4 text-slate-500 transition", menuOpen && "rotate-180")} />
            </button>

            {menuOpen ? (
              <div className="absolute right-0 z-40 mt-3 w-56 rounded-3xl border border-border bg-white p-2 shadow-2xl">
                <div className="border-b border-border px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>

                <div className="space-y-1 p-2">
                  {isAdmin ? (
                    <Link
                      href={inAdminPanel ? "/dashboard" : "/dashboard/admin"}
                      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-muted"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Shield className="h-4 w-4 text-slate-500" />
                      {inAdminPanel ? "Back to App" : "Admin Panel"}
                    </Link>
                  ) : null}

                  <Link
                    href="/dashboard/notifications"
                    className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-muted"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Bell className="h-4 w-4 text-slate-500" />
                    Alerts
                  </Link>

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
          <h1 className="max-w-[15ch] text-[1.65rem] font-semibold leading-[1.08] text-slate-900 min-[375px]:text-[1.78rem] min-[430px]:max-w-none min-[430px]:text-[1.95rem]">
            Welcome back, {user.name}
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/dashboard/income"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 min-[390px]:h-12"
          >
            <Plus className="h-4 w-4" />
            Income
          </Link>
          <Link
            href="/dashboard/expenses"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-white px-4 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-muted min-[390px]:h-12"
          >
            <Plus className="h-4 w-4" />
            Expense
          </Link>
        </div>
      </div>

      <div className="hidden w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 lg:grid">
        <div className="mx-auto flex w-full max-w-2xl min-w-0 items-center gap-2 rounded-2xl border border-border bg-white px-3.5 text-sm text-slate-500 shadow-sm h-11 min-[390px]:h-12 min-[390px]:px-4">
          <Search className="h-4 w-4 shrink-0 text-slate-500" />
          <span className="truncate text-[13px] min-[390px]:text-sm">Search records, budgets, wallets...</span>
        </div>
        <div className="flex items-center justify-end gap-2 min-[390px]:gap-3">
          <Link
            href="/dashboard/income"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-3.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 min-[390px]:h-12 min-[390px]:px-4 lg:min-w-[132px]"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden min-[375px]:inline">Income</span>
          </Link>
          <Link
            href="/dashboard/expenses"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-white px-3.5 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-muted min-[390px]:h-12 min-[390px]:px-4 lg:min-w-[132px]"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden min-[375px]:inline">Expense</span>
          </Link>

          <div className="relative" ref={desktopMenuRef}>
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-border bg-white px-2.5 shadow-sm transition hover:bg-muted min-[390px]:h-12 min-[390px]:px-3"
              onClick={() => setMenuOpen((current) => !current)}
              aria-label="Open profile menu"
            >
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt={user.name || "Profile image"} className="h-7 w-7 rounded-full object-cover min-[390px]:h-8 min-[390px]:w-8" />
              ) : (
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground min-[390px]:h-8 min-[390px]:w-8">
                  {initials}
                </span>
              )}
              <ChevronDown className={cn("h-4 w-4 text-slate-500 transition", menuOpen && "rotate-180")} />
            </button>

            {menuOpen ? (
              <div className="absolute right-0 z-40 mt-3 w-56 rounded-3xl border border-border bg-white p-2 shadow-2xl">
                <div className="border-b border-border px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>

                <div className="space-y-1 p-2">
                  {isAdmin ? (
                    <Link
                      href={inAdminPanel ? "/dashboard" : "/dashboard/admin"}
                      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-muted"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Shield className="h-4 w-4 text-slate-500" />
                      {inAdminPanel ? "Back to App" : "Admin Panel"}
                    </Link>
                  ) : null}

                  <Link
                    href="/dashboard/notifications"
                    className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-muted"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Bell className="h-4 w-4 text-slate-500" />
                    Alerts
                  </Link>

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
