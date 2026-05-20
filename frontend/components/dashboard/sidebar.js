"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRightLeft,
  Banknote,
  Bell,
  ChartColumn,
  CircleDollarSign,
  CircleUserRound,
  Coins,
  CreditCard,
  FileText,
  FileBarChart2,
  FolderKanban,
  HandCoins,
  House,
  Landmark,
  LayoutDashboard,
  Lightbulb,
  Menu,
  ReceiptText,
  Repeat,
  Settings,
  Shield,
  Target,
  Tags,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ADMIN_PANEL_ITEMS, SIDEBAR_ITEMS } from "@/lib/constants";
import { resolveAssetUrl } from "@/lib/uploads";
import { cn } from "@/lib/utils";

const sidebarIconMap = {
  "/dashboard": LayoutDashboard,
  "/dashboard/transactions": ReceiptText,
  "/dashboard/income": Banknote,
  "/dashboard/expenses": CircleDollarSign,
  "/dashboard/categories": Tags,
  "/dashboard/budgets": ChartColumn,
  "/dashboard/wallets": Wallet,
  "/dashboard/savings-goals": Target,
  "/dashboard/recurring": Repeat,
  "/dashboard/debts": HandCoins,
  "/dashboard/reports": FileBarChart2,
  "/dashboard/notifications": Bell,
  "/dashboard/ai-insights": Lightbulb,
  "/dashboard/receipts": ReceiptText,
  "/dashboard/currencies": Coins,
  "/dashboard/groups": Users,
  "/dashboard/policy": FileText,
  "/dashboard/settings": Settings,
  "/dashboard/profile": CircleUserRound,
  "/dashboard/admin": LayoutDashboard,
  "/dashboard/admin/users": CircleUserRound,
  "/dashboard/admin/custom-pages": FileText,
  "/dashboard/admin/activity": ChartColumn,
  "/dashboard/admin/integrity": Shield,
  "/dashboard/admin/access": CreditCard,
  "/dashboard/admin/finance": Landmark,
  "/dashboard/admin/collaboration": Users,
  "/dashboard/admin/platform": House,
  "/dashboard/admin/site-settings": Settings,
  "/dashboard/admin/auth-providers": ArrowRightLeft,
};

const APP_VERSION = "1.0.1";

export function Sidebar({ user, siteName = "Finance Tracker", siteTagline = "Personal finance command center" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const isAdmin = user?.role === "admin";
  const inAdminPanel = pathname.startsWith("/dashboard/admin");
  const items = inAdminPanel ? ADMIN_PANEL_ITEMS : SIDEBAR_ITEMS;
  const userImageUrl = resolveAssetUrl(user?.image);
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
          "fixed inset-y-0 left-0 z-40 flex h-screen w-[85vw] max-w-72 flex-col border-r border-border bg-[#112215] px-5 py-6 pb-28 text-white transition lg:w-72 lg:translate-x-0 lg:pb-6",
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
            {userImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userImageUrl} alt={user.name || "Profile image"} className="h-full w-full object-cover" />
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
            <p className="text-lg font-semibold">{siteName}</p>
            <p className="text-sm text-emerald-100/70">{siteTagline}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto pr-1 pb-40 lg:pb-4">
          {items.map((item) => {
            const active =
              item.href === "/dashboard" || item.href === "/dashboard/admin"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            const Icon = sidebarIconMap[item.href] || House;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  active ? "!bg-white !text-slate-900 shadow-sm" : "text-emerald-50/85 hover:bg-white/10 hover:text-white",
                )}
                onClick={() => setOpen(false)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {isAdmin ? (
          <div className="mt-6 hidden rounded-3xl border border-white/10 bg-white/5 p-4 lg:block">
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

        <div className="pointer-events-none absolute right-5 bottom-3 left-5 z-50 lg:pointer-events-auto lg:static lg:right-auto lg:bottom-auto lg:left-auto lg:z-auto lg:mt-6">
          <div className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-4 text-emerald-50/88 shadow-[0_18px_50px_rgba(3,12,8,0.34)] backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5 hover:border-emerald-300/20 hover:bg-white/[0.07] hover:shadow-[0_24px_70px_rgba(6,35,20,0.42)] active:scale-[0.985] sm:p-5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.16),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]" />
          <div className="pointer-events-none absolute -top-12 right-[-10%] h-28 w-28 rounded-full bg-emerald-400/12 blur-3xl transition duration-300 group-hover:bg-emerald-300/18" />
          <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <div className="relative">
            <div className="text-center">
              <p className="text-sm font-semibold tracking-[0.08em] text-white sm:text-[1.05rem]">{`Version ${APP_VERSION}`}</p>
            </div>

            <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

            <p className="text-center text-[11px] leading-5 text-emerald-100/62">{`© ${currentYear} ${siteName} All rights reserved.`}</p>
          </div>
        </div>
        </div>

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
            onClick={() => setOpen((current) => !current)}
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </>
  );
}
