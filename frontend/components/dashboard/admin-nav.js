"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FolderTree, Layers3, MessagesSquare, Settings2, ShieldCheck, Users } from "lucide-react";
import { ADMIN_PANEL_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const iconMap = {
  "/dashboard/admin": ShieldCheck,
  "/dashboard/admin/users": Users,
  "/dashboard/admin/activity": BarChart3,
  "/dashboard/admin/integrity": Layers3,
  "/dashboard/admin/access": ShieldCheck,
  "/dashboard/admin/finance": FolderTree,
  "/dashboard/admin/collaboration": MessagesSquare,
  "/dashboard/admin/platform": Layers3,
  "/dashboard/admin/site-settings": Settings2,
};

const descriptionMap = {
  "/dashboard/admin": "Platform snapshot",
  "/dashboard/admin/users": "Manage every account",
  "/dashboard/admin/activity": "Track global changes",
  "/dashboard/admin/integrity": "Incomplete and risky records",
  "/dashboard/admin/access": "Users, sessions, and auth",
  "/dashboard/admin/finance": "Wallets, budgets, and ledger",
  "/dashboard/admin/collaboration": "Groups, receipts, and alerts",
  "/dashboard/admin/platform": "Read-only config snapshot",
  "/dashboard/admin/site-settings": "SEO, branding, SMTP, verification",
};

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {ADMIN_PANEL_ITEMS.map((item) => {
        const active = item.href === "/dashboard/admin" ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = iconMap[item.href] || ShieldCheck;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-3xl border p-4 transition",
              active ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-card hover:bg-muted",
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn("rounded-2xl p-3", active ? "bg-white/15" : "bg-muted text-slate-700")}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className={cn("text-xs", active ? "text-primary-foreground/80" : "text-slate-500")}>{descriptionMap[item.href]}</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
