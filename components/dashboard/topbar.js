"use client";

import Link from "next/link";
import { LogOut, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { AlertsDropdown } from "@/components/dashboard/alerts-dropdown";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/lib/client-auth";

export function Topbar({ user }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = user?.role === "admin";
  const inAdminPanel = pathname.startsWith("/dashboard/admin");

  async function handleLogout() {
    await logoutUser();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="pl-14 sm:pl-0">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-500 sm:text-sm sm:tracking-[0.3em]">Finance Overview</p>
        <h1 className="max-w-[12ch] text-2xl font-semibold leading-tight sm:max-w-none sm:text-3xl">Welcome back, {user.name}</h1>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:flex-wrap sm:justify-end">
        <div className="col-span-2 flex min-w-0 items-center gap-2 rounded-2xl border border-border bg-white px-4 py-3 sm:min-w-[280px]">
          <Search className="h-4 w-4 text-slate-500" />
          <span className="truncate text-sm text-slate-500">Search records, budgets, wallets...</span>
        </div>
        {isAdmin ? (
          <Link
            href={inAdminPanel ? "/dashboard" : "/dashboard/admin"}
            className="col-span-2 inline-flex items-center justify-center rounded-2xl border border-border !bg-white px-4 py-3 text-sm font-medium !text-slate-900 shadow-sm transition hover:bg-muted sm:col-span-1"
          >
            {inAdminPanel ? "Back to App" : "Admin Panel"}
          </Link>
        ) : null}
        <AlertsDropdown />
        <Button className="col-span-2 gap-2 sm:col-span-1" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
