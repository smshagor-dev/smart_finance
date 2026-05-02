"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { formatDate } from "@/lib/utils";

const typeOptions = [
  { value: "", label: "All activity" },
  { value: "user", label: "Users" },
  { value: "transaction", label: "Transactions" },
  { value: "group", label: "Groups" },
  { value: "message", label: "Messages" },
  { value: "receipt", label: "Receipts" },
  { value: "notification", label: "Notifications" },
];

export function AdminActivityPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ search: "", type: "", page: 1, pageSize: 15 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const params = new URLSearchParams(
      Object.entries(filters)
        .filter(([, value]) => value)
        .map(([key, value]) => [key, String(value)]),
    );

    fetch(`/api/admin/activity?${params.toString()}`)
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        setItems(data.items || []);
        setPagination(data.pagination || null);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters]);

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
          <input
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none"
            placeholder="Search activity, users, or entities"
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, page: 1 }))}
          />
          <select
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none"
            value={filters.type}
            onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value, page: 1 }))}
          >
            {typeOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="p-5">
        {loading ? (
          <LoadingSkeleton rows={8} />
        ) : items.length ? (
          <div className="space-y-3">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.href || "/dashboard/admin"}
                className="block rounded-3xl border border-border bg-white p-4 transition hover:bg-muted"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                        {item.type}
                      </span>
                      <span className="text-xs text-slate-400">{formatDate(item.timestamp)}</span>
                    </div>
                    <p className="mt-3 text-base font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                  </div>
                  <div className="rounded-2xl bg-muted px-4 py-3 text-sm">
                    <p className="font-medium">{item.user?.name || "System"}</p>
                    <p className="text-xs text-slate-500">{item.user?.email || "Platform event"}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-8 text-center text-sm text-slate-500">No activity found</div>
        )}
      </Card>

      {pagination ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={pagination.page <= 1}
              onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
