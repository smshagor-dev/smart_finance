"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Banknote,
  Briefcase,
  Car,
  Clapperboard,
  Coins,
  CreditCard,
  Gem,
  GraduationCap,
  Heart,
  HeartPulse,
  House,
  Landmark,
  PiggyBank,
  Plane,
  Receipt,
  Shield,
  ShoppingBag,
  Smartphone,
  Target,
  Trophy,
  Utensils,
  Vault,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast-provider";
import { useLiveUpdateListener } from "@/lib/live-client";
import { formatCurrency, formatDate } from "@/lib/utils";

const fieldTypeToInput = {
  text: "text",
  number: "number",
  date: "date",
};

const iconMap = {
  utensils: Utensils,
  house: House,
  car: Car,
  "shopping-bag": ShoppingBag,
  receipt: Receipt,
  "heart-pulse": HeartPulse,
  "graduation-cap": GraduationCap,
  clapperboard: Clapperboard,
  briefcase: Briefcase,
  coins: Coins,
  wallet: WalletIconFallback,
  banknote: Banknote,
  landmark: Landmark,
  "credit-card": CreditCard,
  smartphone: Smartphone,
  "piggy-bank": PiggyBank,
  vault: Vault,
  target: Target,
  plane: Plane,
  gem: Gem,
  heart: Heart,
  shield: Shield,
  trophy: Trophy,
};

function WalletIconFallback(props) {
  return <CreditCard {...props} />;
}

function renderCell(item, column) {
  const value = column.accessor.split(".").reduce((current, key) => current?.[key], item);
  if (column.format === "currency") {
    const currencyCode = column.currencyAccessor
      ? column.currencyAccessor.split(".").reduce((current, key) => current?.[key], item)
      : "USD";
    return formatCurrency(value, currencyCode || "USD");
  }
  if (column.format === "date") return formatDate(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return value || "-";
}

function renderCardValue(item, column) {
  return renderCell(item, column);
}

function IconPicker({ field, value, onChange }) {
  const options = field.options || [];

  return (
    <div className="max-h-72 overflow-y-auto pr-1">
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
        {options.map((option) => {
          const Icon = iconMap[option.value] || Coins;
          const active = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              title={option.label}
              aria-label={option.label}
              className={`flex items-center justify-center rounded-2xl border p-3 transition ${
                active ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "border-border bg-white hover:bg-muted"
              }`}
              onClick={() => onChange(option.value)}
            >
              <div className={`rounded-xl p-2 ${active ? "bg-primary text-primary-foreground" : "bg-muted text-slate-600"}`}>
                <Icon className="h-4 w-4" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function endpointToResource(endpoint) {
  return endpoint.replace(/^\/api\//, "");
}

export function ModulePage({
  title,
  description,
  endpoint,
  columns,
  fields,
  defaultValues = {},
  lookups = [],
  baseFilters = {},
  filterFields = [],
}) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ search: "", page: 1, sort: "newest" });
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultValues);
  const [lookupData, setLookupData] = useState({});
  const hasLoadedRef = useRef(false);
  const toast = useToast();
  const baseFiltersKey = JSON.stringify(baseFilters || {});
  const lookupsKey = JSON.stringify(lookups || []);
  const stableBaseFilters = useMemo(() => JSON.parse(baseFiltersKey), [baseFiltersKey]);
  const stableLookups = useMemo(() => JSON.parse(lookupsKey), [lookupsKey]);
  const liveResources = Array.from(new Set([endpointToResource(endpoint), ...stableLookups]));

  async function fetchData({ silent = false } = {}) {
    if (!silent) {
      setLoading(true);
    }

    const params = new URLSearchParams(
      Object.entries({ ...stableBaseFilters, ...filters })
        .filter(([, value]) => value)
        .map(([key, value]) => [key, String(value)]),
    );
    const response = await fetch(`${endpoint}?${params.toString()}`);
    const data = await response.json();
    setItems(data.items || []);
    setPagination(data.pagination || null);
    setLoading(false);
    setHasLoaded(true);
    hasLoadedRef.current = true;
  }

  async function fetchLookups() {
    if (!stableLookups.length) return;
    const response = await fetch("/api/dashboard/overview?mode=lookups");
    const data = await response.json();
    setLookupData(data.lookups || {});
  }

  useEffect(() => {
    let active = true;

    async function load() {
      if (!hasLoadedRef.current) {
        setLoading(true);
      }

      const params = new URLSearchParams(
        Object.entries({ ...stableBaseFilters, ...filters })
          .filter(([, value]) => value)
          .map(([key, value]) => [key, String(value)]),
      );
      const response = await fetch(`${endpoint}?${params.toString()}`);
      const data = await response.json();
      if (!active) return;
      setItems(data.items || []);
      setPagination(data.pagination || null);
      setLoading(false);
      setHasLoaded(true);
      hasLoadedRef.current = true;
    }

    load();
    return () => {
      active = false;
    };
  }, [endpoint, filters, stableBaseFilters]);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!stableLookups.length) return;
      const response = await fetch("/api/dashboard/overview?mode=lookups");
      const data = await response.json();
      if (!active) return;
      setLookupData(data.lookups || {});
    }

    load();
    return () => {
      active = false;
    };
  }, [stableLookups]);

  useLiveUpdateListener(liveResources, () => {
    fetchData({ silent: true });
    fetchLookups();
  });

  function openCreate() {
    setEditing(null);
    setForm(defaultValues);
    setOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    const nextForm = {};
    fields.forEach((field) => {
      const value = item[field.name];
      nextForm[field.name] = field.type === "date" && value ? new Date(value).toISOString().slice(0, 10) : value ?? "";
    });
    setForm(nextForm);
    setOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const response = await fetch(editing ? `${endpoint}/${editing.id}` : endpoint, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...stableBaseFilters, ...form }),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.push(data.error || "Save failed", "error");
      return;
    }
    toast.push(editing ? "Record updated" : "Record created");
    setOpen(false);
    fetchData({ silent: true });
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this record?")) return;
    const response = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.push("Delete failed", "error");
      return;
    }
    toast.push("Record deleted");
    fetchData({ silent: true });
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 lg:flex-row">
              <input
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none lg:max-w-sm"
                placeholder="Search"
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, page: 1 }))}
              />
              <select
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none lg:w-auto"
                value={filters.sort}
                onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="amount">Amount</option>
              </select>
              <Button className="w-full lg:w-auto" onClick={openCreate}>Add New</Button>
            </div>

            {filterFields.length ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {filterFields.map((field) => (
                  <label key={field.name}>
                    <span className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-slate-500">{field.label}</span>
                    {field.type === "select" ? (
                      <select
                        className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none"
                        value={filters[field.name] ?? ""}
                        onChange={(event) => setFilters((current) => ({ ...current, [field.name]: event.target.value, page: 1 }))}
                      >
                        <option value="">All</option>
                        {(lookupData[field.lookupKey] || field.options || []).map((option) => (
                          <option key={option.value || option.id} value={option.value || option.id}>
                            {option.label || option.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type === "date" ? "date" : "text"}
                        className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none"
                        value={filters[field.name] ?? ""}
                        onChange={(event) => setFilters((current) => ({ ...current, [field.name]: event.target.value, page: 1 }))}
                      />
                    )}
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {!hasLoaded && loading ? (
          <div className="p-6">
            <LoadingSkeleton rows={5} />
          </div>
        ) : (
          <>
            <div className="grid gap-4 p-4 md:hidden">
              {items.length ? (
                items.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-border bg-white p-4">
                    <div className="space-y-3">
                      {columns.map((column) => (
                        <div key={column.accessor} className="flex items-start justify-between gap-4">
                          <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">{column.label}</span>
                          <span className="text-right text-sm font-medium text-slate-900">{renderCardValue(item, column)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button className="flex-1" variant="secondary" onClick={() => openEdit(item)}>
                        Edit
                      </Button>
                      <Button className="flex-1" variant="danger" onClick={() => handleDelete(item.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-slate-500">No data found</div>
              )}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    {columns.map((column) => (
                      <th key={column.accessor} className="px-4 py-3 font-medium text-slate-600">
                        {column.label}
                      </th>
                    ))}
                    <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length ? (
                    items.map((item) => (
                      <tr key={item.id} className="border-t border-border">
                        {columns.map((column) => (
                          <td key={column.accessor} className="px-4 py-3">
                            {renderCell(item, column)}
                          </td>
                        ))}
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button variant="secondary" onClick={() => openEdit(item)}>
                              Edit
                            </Button>
                            <Button variant="danger" onClick={() => handleDelete(item.id)}>
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-t border-border">
                      <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-sm text-slate-500">
                        No data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {pagination ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Page {pagination.page} of {pagination.totalPages || 1}
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

      <Modal open={open} title={editing ? `Edit ${title}` : `Create ${title}`} onClose={() => setOpen(false)}>
        <form className="grid max-h-[75vh] gap-4 overflow-y-auto pr-1 md:grid-cols-2" onSubmit={handleSubmit}>
          {fields.map((field) => (
            <label key={field.name} className={field.fullWidth ? "md:col-span-2" : ""}>
              <span className="mb-2 block text-sm font-medium">{field.label}</span>
              {field.type === "icon-select" ? (
                <IconPicker
                  field={field}
                  value={form[field.name] ?? ""}
                  onChange={(value) => setForm((current) => ({ ...current, [field.name]: value }))}
                />
              ) : field.type === "select" ? (
                <select
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                  value={form[field.name] ?? ""}
                  onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                >
                  <option value="">Select</option>
                  {(field.options || lookupData[field.lookupKey] || []).map((option) => (
                    <option key={option.value || option.id} value={option.value || option.id}>
                      {option.label || option.name}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  className="min-h-28 w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                  value={form[field.name] ?? ""}
                  onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                />
              ) : (
                <input
                  type={fieldTypeToInput[field.type] || "text"}
                  step={field.type === "number" ? "0.01" : undefined}
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                  value={form[field.name] ?? ""}
                  onChange={(event) => {
                    const value = field.type === "checkbox" ? event.target.checked : event.target.value;
                    setForm((current) => ({ ...current, [field.name]: value }));
                  }}
                />
              )}
            </label>
          ))}
          <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:justify-end">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? "Update" : "Create"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
