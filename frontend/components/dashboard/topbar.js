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
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Finance Overview</p>
        <h1 className="text-3xl font-semibold">Welcome back, {user.name}</h1>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-white px-4 py-3">
          <Search className="h-4 w-4 text-slate-500" />
          <span className="text-sm text-slate-500">Search records, budgets, wallets...</span>
        </div>
        {isAdmin ? (
          <Link
            href={inAdminPanel ? "/dashboard" : "/dashboard/admin"}
            className="inline-flex items-center justify-center rounded-2xl border border-border !bg-white px-4 py-3 text-sm font-medium !text-slate-900 shadow-sm transition hover:bg-muted"
          >
            {inAdminPanel ? "Back to App" : "Admin Panel"}
          </Link>
        ) : null}
        <AlertsDropdown />
        <Button className="gap-2" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
