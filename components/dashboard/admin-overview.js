"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Activity, Bell, FolderKanban, Receipt, Users, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";

const statCards = [
  { key: "totalUsers", label: "Total Users", icon: Users },
  { key: "totalWallets", label: "Wallets", icon: Wallet },
  { key: "totalGroups", label: "Groups", icon: FolderKanban },
  { key: "totalReceipts", label: "Receipts", icon: Receipt },
  { key: "totalNotifications", label: "Notifications", icon: Bell },
  { key: "monthlyTransactions", label: "This Month", icon: Activity },
];

export function AdminOverview() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;

    fetch("/api/admin/overview")
      .then((response) => response.json())
      .then((payload) => {
        if (active) {
          setData(payload);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (!data) {
    return <LoadingSkeleton rows={8} />;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map((item) => {
          const Icon = item.icon;
          const value = item.key === "monthlyTransactions" ? data.stats?.[item.key] || 0 : data.stats?.[item.key] || 0;

          return (
            <Card key={item.key} className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold">{value}</p>
                </div>
                <div className="rounded-2xl bg-muted p-3 text-slate-700">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Platform health</h3>
              <p className="mt-1 text-sm text-slate-500">Verification coverage, admin access, and transaction throughput.</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              {data.stats?.verifiedUsers || 0} verified
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-muted p-4">
              <p className="text-sm text-slate-500">Admin Accounts</p>
              <p className="mt-2 text-2xl font-semibold">{data.stats?.totalAdmins || 0}</p>
            </div>
            <div className="rounded-3xl bg-muted p-4">
              <p className="text-sm text-slate-500">Transactions</p>
              <p className="mt-2 text-2xl font-semibold">{data.stats?.totalTransactions || 0}</p>
            </div>
            <div className="rounded-3xl bg-muted p-4">
              <p className="text-sm text-slate-500">Monthly Volume</p>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(data.stats?.monthlyVolume || 0, "USD")}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-lg font-semibold">Recent users</h3>
          <div className="mt-4 space-y-3">
            {data.recentUsers?.length ? (
              data.recentUsers.map((user) => (
                <Link key={user.id} href={`/dashboard/admin/users/${user.id}`} className="block rounded-2xl bg-muted p-4 transition hover:bg-slate-100">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{user.name || "Unnamed user"}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">{user.role}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{formatDate(user.createdAt)}</p>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-slate-500">No users found</div>
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-lg font-semibold">Latest transactions</h3>
          <div className="mt-4 space-y-3">
            {data.recentTransactions?.length ? (
              data.recentTransactions.map((transaction) => (
                <Link
                  key={transaction.id}
                  href={`/dashboard/admin/users/${transaction.user?.id}`}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-muted p-4 transition hover:bg-slate-100"
                >
                  <div>
                    <p className="font-medium">{transaction.user?.name || transaction.user?.email || "User"}</p>
                    <p className="text-sm text-slate-500">
                      {transaction.category?.name || transaction.type} • {formatDate(transaction.transactionDate)}
                    </p>
                  </div>
                  <p className="font-semibold">{formatCurrency(transaction.convertedAmount ?? transaction.amount, "USD")}</p>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-slate-500">No transaction activity yet</div>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-lg font-semibold">Shared groups</h3>
          <div className="mt-4 space-y-3">
            {data.recentGroups?.length ? (
              data.recentGroups.map((group) => (
                <div key={group.id} className="rounded-2xl bg-muted p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{group.name}</p>
                      <p className="text-sm text-slate-500">Owner: {group.owner?.name || group.owner?.email}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                      {group._count.members} members
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    {group._count.transactions} transactions • {group._count.messages} messages
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-slate-500">No groups found</div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
