"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, FilePlus2, PencilLine, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast-provider";
import { formatDate, formatDateTime } from "@/lib/utils";

function readJson(response) {
  return response.text().then((text) => {
    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      return { error: text };
    }
  });
}

function StatusBadge({ status }) {
  const active = status === "published";
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${active ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
      <span className={`h-2 w-2 rounded-full ${active ? "bg-emerald-500" : "bg-amber-500"}`} />
      {active ? "Published" : "Draft"}
    </span>
  );
}

export function AdminCustomPagesPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ search: "", status: "", page: 1, pageSize: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const queryString = useMemo(
    () =>
      new URLSearchParams(
        Object.entries(filters)
          .filter(([, value]) => value)
          .map(([key, value]) => [key, String(value)]),
      ).toString(),
    [filters],
  );

  async function loadPages({ silent = false } = {}) {
    if (!silent) {
      setLoading(true);
      setError("");
    }

    try {
      const response = await fetch(`/api/admin/pages?${queryString}`, { cache: "no-store" });
      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(data.error || "Failed to load pages");
      }

      setItems(data.items || []);
      setPagination(data.pagination || null);
    } catch (loadError) {
      setError(loadError.message || "Failed to load pages");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    fetch(`/api/admin/pages?${queryString}`, { cache: "no-store" })
      .then(readJson)
      .then((data) => {
        if (!active) return;
        if (data.error && !data.items) {
          throw new Error(data.error || "Failed to load pages");
        }
        setItems(data.items || []);
        setPagination(data.pagination || null);
        setError("");
        setLoading(false);
      })
      .catch((loadError) => {
        if (!active) return;
        setItems([]);
        setPagination(null);
        setError(loadError.message || "Failed to load pages");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [queryString, reloadKey]);

  async function updateStatus(item, status) {
    const actionKey = `${item.id}:${status}`;
    setActionLoading(actionKey);
    const response = await fetch(`/api/admin/pages/${item.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await readJson(response);
    setActionLoading("");

    if (!response.ok) {
      toast.push(data.error || "Could not update page status", "error");
      return;
    }

    toast.push(status === "published" ? "Page published" : "Page moved to draft");
    setReloadKey((current) => current + 1);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setActionLoading(`${deleteTarget.id}:delete`);
    const response = await fetch(`/api/admin/pages/${deleteTarget.id}`, { method: "DELETE" });
    const data = await readJson(response);
    setActionLoading("");

    if (!response.ok) {
      toast.push(data.error || "Could not delete page", "error");
      return;
    }

    toast.push("Page deleted");
    setDeleteTarget(null);
    setReloadKey((current) => current + 1);
  }

  return (
    <div className="space-y-6">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">Content Control</p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Custom Pages</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Create and publish public policy, legal, and company pages with custom SEO and rich content.
            </p>
          </div>
          <Link href="/dashboard/admin/custom-pages/new">
            <Button className="gap-2">
              <FilePlus2 className="h-4 w-4" />
              Create page
            </Button>
          </Link>
        </div>
      </Card>

      <Card className="p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-2xl border border-border bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary"
              placeholder="Search by title or slug"
              value={filters.search}
              onChange={(event) => {
                setLoading(true);
                setFilters((current) => ({ ...current, search: event.target.value, page: 1 }));
              }}
            />
          </label>
          <select
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none"
            value={filters.status}
            onChange={(event) => {
              setLoading(true);
              setFilters((current) => ({ ...current, status: event.target.value, page: 1 }));
            }}
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <div className="flex items-center justify-end text-sm text-slate-500">
            {pagination ? `${pagination.total} pages` : "Pages"}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton rows={8} />
          </div>
        ) : error ? (
          <div className="p-6">
            <EmptyState title="Could not load pages" description={error} />
            <div className="mt-4 flex justify-center">
              <Button variant="secondary" onClick={() => loadPages()}>
                Retry
              </Button>
            </div>
          </div>
        ) : items.length ? (
          <div className="grid gap-4 p-4 sm:p-5">
            {items.map((item) => {
              const isPublished = item.status === "published";
              const busy = actionLoading.startsWith(`${item.id}:`);

              return (
                <div key={item.id} className="rounded-3xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="mt-2 break-all text-sm text-primary">{`/${item.slug}`}</p>
                      {item.shortDescription ? <p className="mt-2 text-sm text-slate-500">{item.shortDescription}</p> : null}
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                        <span>Created {formatDate(item.createdAt)}</span>
                        <span>Updated {formatDateTime(item.updatedAt)}</span>
                        <span>{isPublished && item.publishedAt ? `Published ${formatDate(item.publishedAt)}` : "Not published yet"}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {isPublished ? (
                        <a href={`/${item.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium transition hover:bg-muted">
                          <ExternalLink className="h-4 w-4" />
                          Preview
                        </a>
                      ) : null}
                      <Link href={`/dashboard/admin/custom-pages/${item.id}`} className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium transition hover:bg-muted">
                        <PencilLine className="h-4 w-4" />
                        Edit
                      </Link>
                      <Button
                        variant="secondary"
                        className="gap-2"
                        disabled={busy}
                        onClick={() => updateStatus(item, isPublished ? "draft" : "published")}
                      >
                        {isPublished ? "Unpublish" : "Publish"}
                      </Button>
                      <Button variant="danger" className="gap-2" disabled={busy} onClick={() => setDeleteTarget(item)}>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6">
            <EmptyState
              title="No custom pages yet"
              description="Create your first public page for privacy policy, terms, about, refund policy, or any other static content."
            />
          </div>
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
              onClick={() => {
                setLoading(true);
                setFilters((current) => ({ ...current, page: Math.max(1, current.page - 1) }));
              }}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => {
                setLoading(true);
                setFilters((current) => ({ ...current, page: Math.min(pagination.totalPages, current.page + 1) }));
              }}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <Modal open={Boolean(deleteTarget)} title="Delete custom page" onClose={() => setDeleteTarget(null)}>
        <div className="space-y-5">
          <p className="text-sm text-slate-600">
            Delete <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={confirmDelete} disabled={actionLoading === `${deleteTarget?.id}:delete`}>
              Confirm delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
