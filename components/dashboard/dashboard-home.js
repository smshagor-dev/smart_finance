"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { MetricCard } from "@/components/dashboard/metric-card";
import { OverviewCharts } from "@/components/dashboard/overview-charts";
import { useLiveUpdateListener } from "@/lib/live-client";
import { formatCurrency, formatDate } from "@/lib/utils";

export function DashboardHome() {
  const [data, setData] = useState(null);

  async function loadDashboard() {
    const response = await fetch("/api/dashboard/overview");
    const payload = await response.json();
    setData(payload);
  }

  useEffect(() => {
    let cancelled = false;

    fetch("/api/dashboard/overview")
      .then((response) => response.json())
      .then((payload) => {
        if (!cancelled) {
          setData(payload);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useLiveUpdateListener(["dashboard"], () => {
    loadDashboard();
  });

  if (!data) {
    return <LoadingSkeleton rows={6} />;
  }

  const stats = {
    totalBalance: data.stats?.totalBalance ?? 0,
    totalIncome: data.stats?.totalIncome ?? 0,
    totalExpense: data.stats?.totalExpense ?? 0,
    monthlySavings: data.stats?.monthlySavings ?? 0,
    currencyCode: data.stats?.currencyCode || "USD",
    expenseByCategory: data.stats?.expenseByCategory || [],
    monthlyTrend: data.stats?.monthlyTrend || [],
  };
  const recentTransactions = data.recentTransactions || [];
  const walletSummary = data.walletSummary || [];
  const upcomingBills = data.upcomingBills || [];
  const budgets = data.budgets || [];
  const insights = data.insights || [];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Balance" value={formatCurrency(stats.totalBalance, stats.currencyCode)} hint="Across all wallets" />
        <MetricCard label="Total Income" value={formatCurrency(stats.totalIncome, stats.currencyCode)} hint="Current month" accent="bg-green-600" />
        <MetricCard label="Total Expense" value={formatCurrency(stats.totalExpense, stats.currencyCode)} hint="Current month" accent="bg-red-600" />
        <MetricCard label="Monthly Savings" value={formatCurrency(stats.monthlySavings, stats.currencyCode)} hint="Income minus expense" accent="bg-blue-600" />
      </section>

      <OverviewCharts categoryData={stats.expenseByCategory} trendData={stats.monthlyTrend} />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <div className="mt-4 space-y-3">
            {recentTransactions.length ? (
              recentTransactions.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl bg-muted p-4">
                  <div>
                    <p className="font-medium">{item.category?.name || item.type}</p>
                    <p className="text-sm text-slate-500">{formatDate(item.transactionDate)}</p>
                  </div>
                  <p className={item.type === "expense" ? "text-red-600" : "text-green-700"}>
                    {item.type === "expense" ? "-" : "+"}
                    {formatCurrency(item.convertedAmount ?? item.amount, stats.currencyCode)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-slate-500">No data found</div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-lg font-semibold">Wallet Balances</h3>
            <div className="mt-4 space-y-3">
              {walletSummary.length ? (
                walletSummary.map((wallet) => (
                  <div key={wallet.id} className="flex items-center justify-between rounded-2xl bg-muted p-4">
                    <p>{wallet.name}</p>
                    <p className="font-medium">{formatCurrency(wallet.displayBalance ?? wallet.balance, stats.currencyCode)}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-slate-500">No data found</div>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-lg font-semibold">Upcoming Bills</h3>
            <div className="mt-4 space-y-3">
              {upcomingBills.length ? (
                upcomingBills.map((bill) => (
                  <div key={bill.id} className="rounded-2xl bg-muted p-4">
                    <p className="font-medium">{bill.title}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatDate(bill.nextDueDate)} | {formatCurrency(bill.displayAmount ?? bill.amount, stats.currencyCode)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No upcoming bills.</p>
              )}
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-lg font-semibold">Budget Usage</h3>
          <div className="mt-4 space-y-4">
            {budgets.length ? (
              budgets.map((budget) => (
                <div key={budget.id}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>{budget.category?.name || "Overall Budget"}</span>
                    <span>{Math.round(budget.progress * 100)}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted">
                    <div
                      className={`h-3 rounded-full ${budget.progress >= 1 ? "bg-red-600" : budget.progress >= 0.8 ? "bg-amber-500" : "bg-primary"}`}
                      style={{ width: `${Math.min(100, budget.progress * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-slate-500">No data found</div>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-lg font-semibold">AI Insights</h3>
          <div className="mt-4 space-y-3">
            {insights.length ? (
              insights.map((insight, index) => (
                <div key={`${insight.title}-${index}`} className="rounded-2xl bg-muted p-4">
                  <p className="font-medium">{insight.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{insight.description}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-slate-500">No data found</div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
