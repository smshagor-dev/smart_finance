"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useLiveUpdateListener } from "@/lib/live-client";
import { formatDate } from "@/lib/utils";

export function CurrenciesPage() {
  const [data, setData] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [canSync, setCanSync] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  async function load(currentPage = page) {
    const [currenciesResponse, profileResponse] = await Promise.all([
      fetch(`/api/currencies?page=${currentPage}&pageSize=${pageSize}&sort=oldest&search=${encodeURIComponent(search)}`),
      fetch("/api/profile"),
    ]);
    const payload = await currenciesResponse.json();
    const profile = await profileResponse.json();
    setData(payload);
    setCanSync(profile.role === "admin");
  }

  useEffect(() => {
    let active = true;

    async function fetchData() {
      const [currenciesResponse, profileResponse] = await Promise.all([
        fetch(`/api/currencies?page=${page}&pageSize=${pageSize}&sort=oldest&search=${encodeURIComponent(search)}`),
        fetch("/api/profile"),
      ]);
      const payload = await currenciesResponse.json();
      const profile = await profileResponse.json();
      if (!active) return;
      setData(payload);
      setCanSync(profile.role === "admin");
    }

    fetchData();
    return () => {
      active = false;
    };
  }, [page, search]);

  useLiveUpdateListener(["currencies", "profile"], () => {
    load(page);
  });

  async function handleSync() {
    setSyncing(true);
    const response = await fetch("/api/currencies/sync");
    const payload = await response.json();
    setSyncing(false);

    if (!response.ok) {
      toast.error(payload.error || "Currency sync failed");
      return;
    }

    toast.success(`Synced ${payload.syncedCurrencyCount} currencies`);
    load(page);
  }

  if (!data) {
    return <LoadingSkeleton rows={5} />;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Currencies</h2>
            <p className="mt-1 text-sm text-slate-500">Live exchange rates synced from ExchangeRate API and stored locally for currency-aware calculations.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              className="rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none"
              placeholder="Search currency by code or name"
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
            />
            <Button onClick={handleSync} disabled={syncing || !canSync}>
              {syncing ? "Syncing..." : "Manual Sync"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Code</th>
                <th className="px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="px-4 py-3 font-medium text-slate-600">Symbol</th>
                <th className="px-4 py-3 font-medium text-slate-600">Rate to USD</th>
                <th className="px-4 py-3 font-medium text-slate-600">Last Synced</th>
              </tr>
            </thead>
            <tbody>
              {(data.items || []).map((currency) => (
                <tr key={currency.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{currency.code}</td>
                  <td className="px-4 py-3">{currency.name || "-"}</td>
                  <td className="px-4 py-3">{currency.symbol || "-"}</td>
                  <td className="px-4 py-3">{currency.exchangeRateToUsd}</td>
                  <td className="px-4 py-3">{formatDate(currency.lastSyncedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {data.pagination ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing page {data.pagination.page} of {data.pagination.totalPages || 1} | Total currencies: {data.pagination.total}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={data.pagination.page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={data.pagination.page >= data.pagination.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
