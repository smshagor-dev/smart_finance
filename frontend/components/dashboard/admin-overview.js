"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Activity, Bell, FolderKanban, Gauge, Receipt, Server, Users, Wallet, Wifi } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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

const providerLabels = {
  email: "Email",
  google: "Google",
  facebook: "Facebook",
  telegram: "Telegram",
};

const deviceLabels = {
  desktop: "Desktop",
  mobile: "Mobile",
  tablet: "Tablet",
  bot: "Bot",
  unknown: "Unknown",
};

const chartPalette = ["#0f766e", "#15803d", "#16a34a", "#2563eb", "#d97706", "#7c3aed"];
const platformMetricColors = ["#0f766e", "#15803d", "#16a34a", "#2563eb", "#d97706", "#7c3aed"];

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

function getInitialClientMetrics() {
  if (typeof window === "undefined") {
    return {
      frontendStatus: "Checking",
      frontendLatency: null,
      apiStatus: "Checking",
      apiLatency: null,
      sessionViews: 0,
      totalViews: 0,
    };
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

  return {
    frontendStatus: navigator.onLine ? "Live" : "Offline",
    frontendLatency,
    apiStatus: "Checking",
    apiLatency: null,
    sessionViews: nextSessionViews,
    totalViews: nextTotalViews,
  };
}

function buildDeviceChartData(deviceStats = {}) {
  return Object.entries(deviceStats)
    .map(([key, value]) => ({
      key,
      name: deviceLabels[key] || key,
      value: Number(value) || 0,
    }))
    .filter((entry) => entry.value > 0);
}

export function AdminOverview() {
  const [data, setData] = useState(null);
  const [usersPage, setUsersPage] = useState(1);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [groupsPage, setGroupsPage] = useState(1);
  const [clientMetrics, setClientMetrics] = useState(getInitialClientMetrics);

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

  const platformStatsChart = [
    { name: "Users", value: data.stats?.totalUsers || 0 },
    { name: "Wallets", value: data.stats?.totalWallets || 0 },
    { name: "Groups", value: data.stats?.totalGroups || 0 },
    { name: "Receipts", value: data.stats?.totalReceipts || 0 },
    { name: "Alerts", value: data.stats?.totalNotifications || 0 },
    { name: "Month Tx", value: data.stats?.monthlyTransactions || 0 },
  ];
  const signupDeviceChart = buildDeviceChartData(data.stats?.signupDeviceCounts);
  const signinDeviceChart = buildDeviceChartData(data.stats?.signinDeviceCounts);

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

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-muted p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">Frontend Status</p>
                <Server className="h-4 w-4 text-slate-500" />
              </div>
              <p className="mt-2 text-2xl font-semibold">{clientMetrics.frontendStatus}</p>
              <p className="mt-1 text-xs text-slate-500">
                {clientMetrics.frontendLatency ? `${clientMetrics.frontendLatency} ms render` : "Client-side health probe"}
              </p>
            </div>
            <div className="rounded-3xl bg-muted p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">API Status</p>
                <Wifi className="h-4 w-4 text-slate-500" />
              </div>
              <p className="mt-2 text-2xl font-semibold">{clientMetrics.apiStatus}</p>
              <p className="mt-1 text-xs text-slate-500">
                {clientMetrics.apiLatency ? `${clientMetrics.apiLatency} ms ping` : "Waiting for health check"}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
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
                <p className="text-sm text-slate-500">Frontend Views</p>
                <Gauge className="h-4 w-4 text-slate-500" />
              </div>
              <p className="mt-2 text-2xl font-semibold">{clientMetrics.sessionViews}</p>
              <p className="mt-1 text-xs text-slate-500">{clientMetrics.totalViews} total admin frontend views on this browser</p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-muted p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">Verified Users</p>
                <Users className="h-4 w-4 text-slate-500" />
              </div>
              <p className="mt-2 text-2xl font-semibold">{data.stats?.verifiedUsers || 0}</p>
              <p className="mt-1 text-xs text-slate-500">Users who completed email verification</p>
            </div>
            <div className="rounded-3xl bg-muted p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">Audit Events</p>
                <Bell className="h-4 w-4 text-slate-500" />
              </div>
              <p className="mt-2 text-2xl font-semibold">{data.stats?.totalAuditLogs || 0}</p>
              <p className="mt-1 text-xs text-slate-500">Tracked admin, auth, and system activity logs</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <div className="rounded-3xl border border-border/60 bg-background p-4">
              <div className="mb-3">
                <h4 className="text-sm font-semibold">Platform footprint</h4>
                <p className="text-xs text-slate-500">Live totals across users, wallets, groups, receipts, alerts, and monthly transactions.</p>
              </div>
              <div className="h-56 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformStatsChart} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                    <Tooltip formatter={(value) => [value, "Count"]} />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                      {platformStatsChart.map((entry, index) => (
                        <Cell key={entry.name} fill={platformMetricColors[index % platformMetricColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <div className="rounded-3xl border border-border/60 bg-background p-4">
              <div className="mb-3">
                <h4 className="text-sm font-semibold">Signup by device</h4>
                <p className="text-xs text-slate-500">Device breakdown from real registration activity logs.</p>
              </div>
              <div className="h-56 sm:h-64">
                {signupDeviceChart.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={signupDeviceChart} dataKey="value" nameKey="name" innerRadius={52} outerRadius={88}>
                        {signupDeviceChart.map((entry, index) => (
                          <Cell key={entry.key} fill={chartPalette[index % chartPalette.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, "Signups"]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 px-4 text-center text-sm text-slate-500">
                    No signup device data yet.
                  </div>
                )}
              </div>
              </div>

              <div className="rounded-3xl border border-border/60 bg-background p-4">
              <div className="mb-3">
                <h4 className="text-sm font-semibold">Signin by device</h4>
                <p className="text-xs text-slate-500">Device breakdown from successful login activity.</p>
              </div>
              <div className="h-56 sm:h-64">
                {signinDeviceChart.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={signinDeviceChart} dataKey="value" nameKey="name" innerRadius={52} outerRadius={88}>
                        {signinDeviceChart.map((entry, index) => (
                          <Cell key={entry.key} fill={chartPalette[index % chartPalette.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, "Signins"]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 px-4 text-center text-sm text-slate-500">
                    No signin device data yet.
                  </div>
                )}
              </div>
              </div>
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
              <h3 className="text-lg font-semibold">Registration providers</h3>
              <p className="mt-1 text-sm text-slate-500">How users originally signed up</p>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-slate-600">
              {data.stats?.totalAuditLogs || 0} audit logs
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Object.entries(data.stats?.registrationProviders || {}).map(([key, value]) => (
              <div key={key} className="rounded-3xl bg-muted p-4">
                <p className="text-sm text-slate-500">{providerLabels[key] || key}</p>
                <p className="mt-2 text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Last login providers</h3>
              <p className="mt-1 text-sm text-slate-500">Most recent provider users came back with</p>
            </div>
            <Link href="/dashboard/admin/auth-providers">
              <Button variant="secondary">Manage providers</Button>
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Object.entries(data.stats?.lastLoginProviders || {}).map(([key, value]) => (
              <div key={key} className="rounded-3xl bg-muted p-4">
                <p className="text-sm text-slate-500">{providerLabels[key] || key}</p>
                <p className="mt-2 text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
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
