"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Activity, Bell, FolderKanban, Gauge, MonitorSmartphone, Receipt, Server, Users, Wallet, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [usersPage, setUsersPage] = useState(1);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [groupsPage, setGroupsPage] = useState(1);
  const [clientMetrics, setClientMetrics] = useState({
    frontendStatus: "Checking",
    frontendLatency: null,
    apiStatus: "Checking",
    apiLatency: null,
    sessionViews: 0,
    totalViews: 0,
    deviceLabel: "Unknown",
    connectionLabel: "Unknown",
  });

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({
      usersPage: String(usersPage),
      transactionsPage: String(transactionsPage),
      groupsPage: String(groupsPage),
    });

    fetch(`/api/admin/overview?${params.toString()}`)
      .then((response) => response.json())
      .then((payload) => {
        if (active) {
          setData(payload);
        }
      });

    return () => {
      active = false;
    };
  }, [groupsPage, transactionsPage, usersPage]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const sessionKey = "sf_admin_session_views";
    const totalKey = "sf_admin_total_views";
    const nextSessionViews = Number(window.sessionStorage.getItem(sessionKey) || "0") + 1;
    const nextTotalViews = Number(window.localStorage.getItem(totalKey) || "0") + 1;
    window.sessionStorage.setItem(sessionKey, String(nextSessionViews));
    window.localStorage.setItem(totalKey, String(nextTotalViews));

    const navigationEntry = performance.getEntriesByType("navigation")[0];
    const frontendLatency =
      navigationEntry && "responseEnd" in navigationEntry ? Math.max(1, Math.round(navigationEntry.responseEnd)) : null;
    const width = window.innerWidth;
    const deviceLabel = width < 640 ? "Mobile" : width < 1024 ? "Tablet" : "Desktop";
    const connectionLabel =
      navigator.connection?.effectiveType || (navigator.onLine ? "online" : "offline");

    setClientMetrics((current) => ({
      ...current,
      frontendStatus: navigator.onLine ? "Live" : "Offline",
      frontendLatency,
      sessionViews: nextSessionViews,
      totalViews: nextTotalViews,
      deviceLabel,
      connectionLabel,
    }));

    let cancelled = false;
    const startedAt = performance.now();

    fetch("/api/health", { cache: "no-store" })
      .then((response) => {
        if (cancelled) return;
        const latency = Math.max(1, Math.round(performance.now() - startedAt));
        setClientMetrics((current) => ({
          ...current,
          apiStatus: response.ok ? "Healthy" : "Issue",
          apiLatency: latency,
        }));
      })
      .catch(() => {
        if (cancelled) return;
        setClientMetrics((current) => ({
          ...current,
          apiStatus: "Unavailable",
          apiLatency: null,
        }));
      });

    function handleOnlineChange() {
      setClientMetrics((current) => ({
        ...current,
        frontendStatus: navigator.onLine ? "Live" : "Offline",
        connectionLabel: navigator.connection?.effectiveType || (navigator.onLine ? "online" : "offline"),
      }));
    }

    window.addEventListener("online", handleOnlineChange);
    window.addEventListener("offline", handleOnlineChange);

    return () => {
      cancelled = true;
      window.removeEventListener("online", handleOnlineChange);
      window.removeEventListener("offline", handleOnlineChange);
    };
  }, []);

  if (!data) {
    return <LoadingSkeleton rows={8} />;
  }

  function PaginationControls({ pageInfo, onPrevious, onNext }) {
    return (
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
        <p className="text-xs text-slate-500">
          Page {pageInfo.page} of {pageInfo.totalPages}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" className="px-3 py-1.5 text-xs" onClick={onPrevious} disabled={pageInfo.page <= 1}>
            Previous
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="px-3 py-1.5 text-xs"
            onClick={onNext}
            disabled={pageInfo.page >= pageInfo.totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    );
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
              <p className="mt-1 text-sm text-slate-500">Frontend-live health, API reachability, Vercel analytics, and transaction throughput.</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              {data.stats?.verifiedUsers || 0} verified
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-3xl bg-muted p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">Frontend Status</p>
                <Server className="h-4 w-4 text-slate-500" />
              </div>
              <p className="mt-2 text-2xl font-semibold">{clientMetrics.frontendStatus}</p>
              <p className="mt-1 text-xs text-slate-500">{clientMetrics.frontendLatency ? `${clientMetrics.frontendLatency} ms render` : "Client-side health probe"}</p>
            </div>
            <div className="rounded-3xl bg-muted p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">API Status</p>
                <Wifi className="h-4 w-4 text-slate-500" />
              </div>
              <p className="mt-2 text-2xl font-semibold">{clientMetrics.apiStatus}</p>
              <p className="mt-1 text-xs text-slate-500">{clientMetrics.apiLatency ? `${clientMetrics.apiLatency} ms ping` : "Waiting for health check"}</p>
            </div>
            <div className="rounded-3xl bg-muted p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">Monthly Volume</p>
                <Activity className="h-4 w-4 text-slate-500" />
              </div>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(data.stats?.monthlyVolume || 0, "USD")}</p>
              <p className="mt-1 text-xs text-slate-500">Overall volume converted to USD</p>
            </div>
            <div className="rounded-3xl bg-muted p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">User Analytics</p>
                <Gauge className="h-4 w-4 text-slate-500" />
              </div>
              <p className="mt-2 text-2xl font-semibold">{clientMetrics.sessionViews}</p>
              <p className="mt-1 text-xs text-slate-500">{clientMetrics.totalViews} total admin page views on this browser</p>
            </div>
            <div className="rounded-3xl bg-muted p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">Client Device</p>
                <MonitorSmartphone className="h-4 w-4 text-slate-500" />
              </div>
              <p className="mt-2 text-2xl font-semibold">{clientMetrics.deviceLabel}</p>
              <p className="mt-1 text-xs text-slate-500">Connection: {clientMetrics.connectionLabel}</p>
            </div>
            <div className="rounded-3xl bg-muted p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">Vercel Analytics</p>
                <Bell className="h-4 w-4 text-slate-500" />
              </div>
              <p className="mt-2 text-2xl font-semibold">Enabled</p>
              <p className="mt-1 text-xs text-slate-500">@vercel/analytics is mounted in the frontend layout</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Recent users</h3>
              <p className="mt-1 text-sm text-slate-500">{data.pagination?.users?.total || 0} users total</p>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-slate-600">10 / page</span>
          </div>
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
          {data.pagination?.users ? (
            <PaginationControls
              pageInfo={data.pagination.users}
              onPrevious={() => setUsersPage((current) => Math.max(1, current - 1))}
              onNext={() => setUsersPage((current) => Math.min(data.pagination.users.totalPages, current + 1))}
            />
          ) : null}
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Latest transactions</h3>
              <p className="mt-1 text-sm text-slate-500">{data.pagination?.transactions?.total || 0} transactions total</p>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-slate-600">10 / page</span>
          </div>
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
                  <p className="font-semibold">
                    {formatCurrency(
                      transaction.originalAmount ?? transaction.amount,
                      transaction.currency?.code || transaction.user?.defaultCurrency?.code || "USD",
                    )}
                  </p>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-slate-500">No transaction activity yet</div>
            )}
          </div>
          {data.pagination?.transactions ? (
            <PaginationControls
              pageInfo={data.pagination.transactions}
              onPrevious={() => setTransactionsPage((current) => Math.max(1, current - 1))}
              onNext={() => setTransactionsPage((current) => Math.min(data.pagination.transactions.totalPages, current + 1))}
            />
          ) : null}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Shared groups</h3>
              <p className="mt-1 text-sm text-slate-500">{data.pagination?.groups?.total || 0} groups total</p>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-slate-600">10 / page</span>
          </div>
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
          {data.pagination?.groups ? (
            <PaginationControls
              pageInfo={data.pagination.groups}
              onPrevious={() => setGroupsPage((current) => Math.max(1, current - 1))}
              onNext={() => setGroupsPage((current) => Math.min(data.pagination.groups.totalPages, current + 1))}
            />
          ) : null}
        </Card>
      </section>
    </div>
  );
}
