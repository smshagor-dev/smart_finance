"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRightLeft, Bell, ChartColumn, CircleUserRound, House, Landmark, Menu, ReceiptText, Shield, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ADMIN_PANEL_ITEMS, SIDEBAR_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Sidebar({ user }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAdmin = user?.role === "admin";
  const inAdminPanel = pathname.startsWith("/dashboard/admin");
  const items = inAdminPanel ? ADMIN_PANEL_ITEMS : SIDEBAR_ITEMS;
  const mobileFooterItems = inAdminPanel
    ? [
        { href: "/dashboard/admin", label: "Home", icon: House },
        { href: "/dashboard/admin/users", label: "Users", icon: CircleUserRound },
        { href: "/dashboard/admin/activity", label: "Activity", icon: ChartColumn },
        { href: "/dashboard/admin/site-settings", label: "Settings", icon: Bell },
      ]
    : [
        { href: "/dashboard", label: "Home", icon: House },
        { href: "/dashboard/transactions", label: "Records", icon: ReceiptText },
        { href: "/dashboard/budgets", label: "Budgets", icon: ChartColumn },
        { href: "/dashboard/profile", label: "Profile", icon: CircleUserRound },
      ];

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("dashboard-mobile-nav", { detail: { open } }));
  }, [open]);

  return (
    <>
      {open ? <button className="fixed inset-0 z-20 bg-slate-950/35 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation" /> : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex h-screen w-[85vw] max-w-72 flex-col border-r border-border bg-[#112215] px-5 py-6 text-white transition lg:w-72 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="pointer-events-none absolute top-6 right-[0px] lg:hidden">
          <button
            type="button"
            className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-sm backdrop-blur transition hover:bg-white/15"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-8 flex items-center gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary">
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={user.name || "Profile image"} className="h-full w-full object-cover" />
            ) : user?.name ? (
              <span className="text-sm font-semibold text-white">
                {user.name
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase())
                  .join("")}
              </span>
            ) : (
              <Landmark className="h-6 w-6" />
            )}
          </div>
          <div>
            <p className="text-lg font-semibold">Finance Tracker</p>
            <p className="text-sm text-emerald-100/70">Personal finance command center</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
          {items.map((item) => {
            const active =
              item.href === "/dashboard" || item.href === "/dashboard/admin"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-2xl px-4 py-3 text-sm font-medium transition",
                  active ? "!bg-white !text-slate-900 shadow-sm" : "text-emerald-50/85 hover:bg-white/10 hover:text-white",
                )}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {isAdmin ? (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-2">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">{inAdminPanel ? "Admin panel active" : "Administrator tools"}</p>
                <p className="text-xs text-emerald-100/70">{inAdminPanel ? "Manage users and platform activity" : "Switch to global control center"}</p>
              </div>
            </div>
            <Link
              href={inAdminPanel ? "/dashboard" : "/dashboard/admin"}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl !bg-white px-4 py-3 text-sm font-semibold !text-slate-900 shadow-sm transition hover:bg-emerald-50"
              onClick={() => setOpen(false)}
            >
              <ArrowRightLeft className="h-4 w-4" />
              {inAdminPanel ? "Back to Finance App" : "Switch to Admin Panel"}
            </Link>
          </div>
        ) : null}
      </aside>

      <div className="fixed inset-x-4 bottom-4 z-30 lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between rounded-[2rem] border border-border bg-white/90 px-3 py-2 shadow-[0_20px_50px_rgba(15,23,42,0.16)] backdrop-blur-xl">
          {mobileFooterItems.map((item) => {
            const active =
              item.href === "/dashboard" || item.href === "/dashboard/admin"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[1.35rem] px-2 py-2 text-[11px] font-medium transition",
                  active ? "bg-primary text-primary-foreground shadow-sm" : "text-slate-500 hover:bg-muted",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            className="ml-2 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.35rem] border border-border bg-white text-slate-700 shadow-sm transition hover:bg-muted"
            onClick={() => setOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </>
  );
}
