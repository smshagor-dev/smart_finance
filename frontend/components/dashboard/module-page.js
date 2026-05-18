"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Banknote,
  Briefcase,
  Car,
  Check,
  ChevronDown,
  Clapperboard,
  Coins,
  CreditCard,
  ExternalLink,
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
  Search,
  Target,
  Trophy,
  Upload,
  Utensils,
  Vault,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast-provider";
import { useLiveUpdateListener } from "@/lib/live-client";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

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

function SearchableSelect({ field, value, options, onChange, placeholder = "Select" }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
        setSearch("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const normalizedOptions = options.map((option) => ({
    key: option.value || option.id,
    value: option.value || option.id,
    label: option.label || option.name || option.code || "",
    symbol: option.symbol || "",
  }));

  const filteredOptions = normalizedOptions.filter((option) => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return true;
    return `${option.label} ${option.symbol}`.toLowerCase().includes(keyword);
  });

  const selectedOption = normalizedOptions.find((option) => option.value === value);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-left outline-none transition focus:border-primary"
        onClick={() =>
          setOpen((current) => {
            const nextOpen = !current;
            if (!nextOpen) {
              setSearch("");
            }
            return nextOpen;
          })
        }
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">{selectedOption?.label || placeholder}</p>
          <p className="truncate text-xs text-slate-500">
            {selectedOption?.symbol || `Search and choose ${field.label.toLowerCase()}`}
          </p>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute z-20 mt-2 w-full rounded-3xl border border-border bg-card p-3 shadow-xl">
          <div className="mb-3 flex items-center gap-2 rounded-2xl border border-border bg-muted px-3 py-2">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              className="w-full bg-transparent text-sm outline-none"
              placeholder={`Search ${field.label.toLowerCase()}`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm hover:bg-muted"
            onClick={() => {
              onChange("");
              setOpen(false);
              setSearch("");
            }}
          >
            <span>{placeholder}</span>
            {!value ? <Check className="h-4 w-4 text-primary" /> : null}
          </button>

          <div className="mt-2 max-h-64 space-y-1 overflow-y-auto">
            {filteredOptions.length ? (
              filteredOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left hover:bg-muted"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{option.label}</p>
                    {option.symbol ? <p className="truncate text-xs text-slate-500">{option.symbol}</p> : null}
                  </div>
                  {value === option.value ? <Check className="h-4 w-4 shrink-0 text-primary" /> : null}
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-sm text-slate-500">No options found.</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
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
                active ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "border-border bg-card hover:bg-muted"
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

function isCurrencySelect(field) {
  return field.lookupKey === "currencies" || field.name.toLowerCase().includes("currency");
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
  showOverallTotal = false,
  extraSummaryCards = [],
  compactTopSummaries = false,
  twoColumnExtraSummaries = false,
}) {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState(null);
  const [overallSummary, setOverallSummary] = useState(null);
  const [overallCount, setOverallCount] = useState(0);
  const [extraSummaries, setExtraSummaries] = useState([]);
  const [filters, setFilters] = useState({ search: "", page: 1, sort: "newest" });
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultValues);
  const [lookupData, setLookupData] = useState({});
  const [uploadingField, setUploadingField] = useState("");
  const hasLoadedRef = useRef(false);
  const toast = useToast();
  const baseFiltersKey = JSON.stringify(baseFilters || {});
  const lookupsKey = JSON.stringify(lookups || []);
  const stableBaseFilters = useMemo(() => JSON.parse(baseFiltersKey), [baseFiltersKey]);
  const stableLookups = useMemo(() => JSON.parse(lookupsKey), [lookupsKey]);
  const liveResources = Array.from(new Set([endpointToResource(endpoint), ...stableLookups]));

  async function fetchExtraSummaries() {
    if (!extraSummaryCards.length) {
      return;
    }

    const results = await Promise.all(
      extraSummaryCards.map(async (card) => {
        const params = new URLSearchParams(
          Object.entries({ ...stableBaseFilters, ...(card.filters || {}), page: 1, pageSize: 1, sort: "newest" })
            .filter(([, value]) => value !== undefined && value !== null && value !== "")
            .map(([key, value]) => [key, String(value)]),
        );

        const response = await fetch(`${endpoint}?${params.toString()}`, {
          cache: "no-store",
        });
        const data = await response.json();

        return {
          ...card,
          summary: data.summary || null,
          total: data.pagination?.total || 0,
        };
      }),
    );

    setExtraSummaries(results);
  }

  async function fetchData({ silent = false } = {}) {
    if (!silent) {
      setLoading(true);
    }

    const params = new URLSearchParams(
      Object.entries({ ...stableBaseFilters, ...filters })
        .filter(([, value]) => value)
        .map(([key, value]) => [key, String(value)]),
    );
    const response = await fetch(`${endpoint}?${params.toString()}`, {
      cache: "no-store",
    });
    const data = await response.json();
    setItems(data.items || []);
    setPagination(data.pagination || null);
    setSummary(data.summary || null);
    setLoading(false);
    setHasLoaded(true);
    hasLoadedRef.current = true;
  }

  async function fetchLookups() {
    if (!stableLookups.length) return;
    const response = await fetch("/api/dashboard/overview?mode=lookups", {
      cache: "no-store",
    });
    const data = await response.json();
    setLookupData(data.lookups || {});
  }

  async function fetchOverallSummary() {
    if (!showOverallTotal) {
      return;
    }

    const params = new URLSearchParams(
      Object.entries({ ...stableBaseFilters, page: 1, pageSize: 1, sort: "newest" })
        .filter(([, value]) => value !== undefined && value !== null && value !== "")
        .map(([key, value]) => [key, String(value)]),
    );

    const response = await fetch(`${endpoint}?${params.toString()}`, {
      cache: "no-store",
    });
    const data = await response.json();
    setOverallSummary(data.summary || null);
    setOverallCount(data.pagination?.total || 0);
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
      const response = await fetch(`${endpoint}?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await response.json();
      if (!active) return;
      setItems(data.items || []);
      setPagination(data.pagination || null);
      setSummary(data.summary || null);
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

    async function loadOverallSummary() {
      if (!showOverallTotal) {
        return;
      }

      const params = new URLSearchParams(
        Object.entries({ ...stableBaseFilters, page: 1, pageSize: 1, sort: "newest" })
          .filter(([, value]) => value !== undefined && value !== null && value !== "")
          .map(([key, value]) => [key, String(value)]),
      );

      const response = await fetch(`${endpoint}?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await response.json();
      if (!active) return;
      setOverallSummary(data.summary || null);
      setOverallCount(data.pagination?.total || 0);
    }

    loadOverallSummary();
    return () => {
      active = false;
    };
  }, [endpoint, showOverallTotal, stableBaseFilters]);

  useEffect(() => {
    let active = true;

    async function loadExtraSummaries() {
      if (!extraSummaryCards.length) {
        return;
      }

      const results = await Promise.all(
        extraSummaryCards.map(async (card) => {
          const params = new URLSearchParams(
            Object.entries({ ...stableBaseFilters, ...(card.filters || {}), page: 1, pageSize: 1, sort: "newest" })
              .filter(([, value]) => value !== undefined && value !== null && value !== "")
              .map(([key, value]) => [key, String(value)]),
          );

          const response = await fetch(`${endpoint}?${params.toString()}`, {
            cache: "no-store",
          });
          const data = await response.json();

          return {
            ...card,
            summary: data.summary || null,
            total: data.pagination?.total || 0,
          };
        }),
      );

      if (!active) return;
      setExtraSummaries(results);
    }

    loadExtraSummaries();
    return () => {
      active = false;
    };
  }, [endpoint, extraSummaryCards, stableBaseFilters]);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!stableLookups.length) return;
      const response = await fetch("/api/dashboard/overview?mode=lookups", {
        cache: "no-store",
      });
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
    fetchOverallSummary();
    fetchExtraSummaries();
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

  async function handleFileUpload(field, file) {
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setUploadingField(field.name);

    try {
      const response = await fetch(field.uploadEndpoint || "/api/uploads/attachments", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        toast.push(data.error || "Upload failed", "error");
        return;
      }

      setForm((current) => ({ ...current, [field.name]: data.fileUrl }));
      toast.push("Attachment uploaded");
    } catch {
      toast.push("Upload failed", "error");
    } finally {
      setUploadingField("");
    }
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
    if (editing) {
      fetchData({ silent: true });
      return;
    }
    router.push("/dashboard");
    router.refresh();
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

  const summaryDateLabel = useMemo(() => {
    if (filters.from && filters.to) {
      return `${filters.from} to ${filters.to}`;
    }
    if (filters.from) {
      return `From ${filters.from}`;
    }
    if (filters.to) {
      return `Up to ${filters.to}`;
    }
    return "Based on current filters";
  }, [filters.from, filters.to]);

  const hasActiveFilters = useMemo(
    () =>
      Object.entries(filters).some(([key, value]) => {
        if (key === "page" || key === "sort") {
          return false;
        }

        return Boolean(value);
      }),
    [filters],
  );

  function resetFilters() {
    setFilters({ search: "", page: 1, sort: "newest" });
  }

  return (
    <div className="space-y-6">
      {compactTopSummaries && showOverallTotal && overallSummary && summary ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="overflow-hidden border-primary/10 bg-gradient-to-br from-primary/10 via-white to-emerald-50/70 p-5 shadow-sm dark:border-primary/20 dark:from-primary/15 dark:via-slate-950 dark:to-slate-900">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80 dark:text-primary/70">Total Overview</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(overallSummary.value || 0, overallSummary.currencyCode || "USD")}
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Overall total across all records in this section</p>
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/80 px-4 py-3 text-right shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{overallSummary.label}</p>
                <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">{overallCount} total records</p>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden border-border p-5 shadow-sm">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] dark:text-slate-400" style={{ color: "var(--module-muted-text)" }}>{summary.label}</p>
                <h2 className="mt-2 text-3xl font-semibold dark:text-slate-100" style={{ color: "var(--module-strong-text)" }}>
                  {formatCurrency(summary.value || 0, summary.currencyCode || "USD")}
                </h2>
                <p className="mt-1 text-sm dark:text-slate-400" style={{ color: "var(--module-muted-text)" }}>{summaryDateLabel}</p>
              </div>
              <div className="rounded-3xl border border-border bg-muted/60 px-4 py-3 text-right">
                <p className="text-xs font-medium uppercase tracking-[0.2em] dark:text-slate-400" style={{ color: "var(--module-muted-text)" }}>Current View</p>
                <p className="mt-1 text-sm font-medium dark:text-slate-300" style={{ color: "var(--module-strong-text)" }}>{pagination?.total || 0} matched records</p>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {extraSummaries.length ? (
        <div className={cn("grid gap-4 md:grid-cols-2", twoColumnExtraSummaries && "grid-cols-2", compactTopSummaries && "xl:grid-cols-2")}>
          {extraSummaries.map((card) => (
            <Card
              key={card.key || card.label}
              className={cn(
                "overflow-hidden border-border/80 bg-card p-5 shadow-sm",
                twoColumnExtraSummaries && "p-4",
              )}
            >
              <div className={cn("flex items-start justify-between gap-4", twoColumnExtraSummaries && "gap-3")}>
                <div>
                  <p
                    className={cn("text-xs font-semibold uppercase tracking-[0.22em] dark:text-slate-400", twoColumnExtraSummaries && "text-[11px] tracking-[0.18em]")}
                    style={{ color: "var(--module-muted-text)" }}
                  >
                    {card.label}
                  </p>
                  <p
                    className={cn("mt-2 text-3xl font-semibold dark:text-slate-100", twoColumnExtraSummaries && "text-[clamp(1.75rem,5vw,2.1rem)] leading-none")}
                    style={{ color: "var(--module-strong-text)" }}
                  >
                    {formatCurrency(card.summary?.value || 0, card.summary?.currencyCode || "USD")}
                  </p>
                  <p
                    className={cn("mt-1 text-sm dark:text-slate-400", twoColumnExtraSummaries && "text-xs leading-5")}
                    style={{ color: "var(--module-body-text)" }}
                  >
                    {card.description || "Overall total across all records"}
                  </p>
                </div>
                <div
                  className={cn(
                    "rounded-2xl px-3 py-2 text-xs font-semibold",
                    twoColumnExtraSummaries && "min-w-[74px] px-2.5 py-1.5 text-[11px] text-center",
                    card.badgeClassName || "bg-muted text-slate-600 dark:text-slate-300",
                  )}
                >
                  {card.badge || `${card.total} records`}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {showOverallTotal && overallSummary && !compactTopSummaries ? (
        <Card
          className={cn(
            "overflow-hidden p-6 shadow-sm",
            compactTopSummaries && "p-5",
          )}
          style={{
            background: "var(--module-overview-surface)",
            borderColor: "var(--module-overview-border)",
          }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80 dark:text-primary/70">Total Overview</p>
                <h2 className="mt-2 text-3xl font-semibold dark:text-slate-100" style={{ color: "var(--module-strong-text)" }}>
                  {formatCurrency(overallSummary.value || 0, overallSummary.currencyCode || "USD")}
                </h2>
              <p className="mt-1 text-sm dark:text-slate-400" style={{ color: "var(--module-body-text)" }}>Overall total across all records in this section</p>
            </div>
            <div
              className="rounded-3xl px-4 py-3 shadow-sm backdrop-blur"
              style={{
                background: "var(--module-overview-pill-bg)",
                border: "1px solid var(--module-overview-pill-border)",
              }}
            >
              <p className="text-xs font-medium uppercase tracking-[0.2em] dark:text-slate-400" style={{ color: "var(--module-muted-text)" }}>{overallSummary.label}</p>
              <p className="mt-1 text-sm font-medium dark:text-slate-300" style={{ color: "var(--module-strong-text)" }}>{overallCount} total records</p>
            </div>
          </div>
        </Card>
      ) : null}

      <Card className="p-4 sm:p-5 lg:p-6">
        <div className="space-y-5 sm:space-y-6">
          <div>
            <h2 className="text-xl font-semibold dark:text-slate-100 sm:text-2xl" style={{ color: "var(--module-strong-text)" }}>{title}</h2>
            <p className="mt-1 text-sm dark:text-slate-400" style={{ color: "var(--module-body-text)" }}>{description}</p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    className="w-full rounded-2xl border border-border bg-card py-3 pl-11 pr-11 text-sm outline-none transition placeholder:text-slate-500 focus:border-primary dark:text-slate-100 dark:placeholder:text-slate-500"
                    style={{ color: "var(--module-input-text)" }}
                    placeholder={`Search ${title.toLowerCase()}`}
                    value={filters.search}
                    onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, page: 1 }))}
                  />
                  {filters.search ? (
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-muted hover:text-slate-700 dark:hover:text-slate-200"
                      onClick={() => setFilters((current) => ({ ...current, search: "", page: 1 }))}
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Sort by</span>
                  <select
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none transition focus:border-primary dark:text-slate-100"
                    style={{ color: "var(--module-input-text)" }}
                    value={filters.sort}
                    onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))}
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="amount">Highest amount</option>
                  </select>
                </label>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row xl:justify-end">
                {hasActiveFilters ? (
                  <Button className="w-full sm:w-auto" variant="secondary" onClick={resetFilters}>
                    Reset filters
                  </Button>
                ) : null}
                <Button className="w-full sm:w-auto" onClick={openCreate}>
                  Add New
                </Button>
              </div>
            </div>

            {filterFields.length ? (
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {filterFields.map((field) => (
                    <label key={field.name} className="rounded-2xl border border-border bg-card p-3 shadow-sm sm:rounded-3xl">
                      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-slate-500">{field.label}</span>
                      {field.type === "select" ? (
                        <select
                          className="w-full rounded-xl border border-border bg-card px-3.5 py-3 text-sm outline-none transition focus:border-primary dark:text-slate-100 sm:rounded-2xl sm:px-4"
                          style={{ color: "var(--module-input-text)" }}
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
                          className="w-full rounded-xl border border-border bg-card px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-500 focus:border-primary dark:text-slate-100 dark:placeholder:text-slate-500 sm:rounded-2xl sm:px-4"
                          style={{ color: "var(--module-input-text)" }}
                          value={filters[field.name] ?? ""}
                          onChange={(event) => setFilters((current) => ({ ...current, [field.name]: event.target.value, page: 1 }))}
                        />
                      )}
                    </label>
                  ))}
                </div>

                {summary && !compactTopSummaries ? (
                  <div className="rounded-2xl border border-border bg-muted/40 p-4 sm:rounded-3xl sm:p-5 dark:border-slate-800 dark:bg-slate-900/70">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{summary.label}</p>
                    <p className="mt-2 text-2xl font-semibold dark:text-slate-100" style={{ color: "var(--module-strong-text)" }}>
                      {formatCurrency(summary.value || 0, summary.currencyCode || "USD")}
                    </p>
                    <p className="mt-1 text-sm dark:text-slate-400" style={{ color: "var(--module-muted-text)" }}>{summaryDateLabel}</p>
                    {pagination?.total ? <p className="mt-3 text-xs dark:text-slate-400" style={{ color: "var(--module-muted-text)" }}>{pagination.total} matched records</p> : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            {summary && !filterFields.length ? (
              <div className="rounded-2xl border border-border bg-muted/40 p-4 sm:rounded-3xl sm:p-5 dark:border-slate-800 dark:bg-slate-900/70">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{summary.label}</p>
                <p className="mt-2 text-2xl font-semibold dark:text-slate-100" style={{ color: "var(--module-strong-text)" }}>
                  {formatCurrency(summary.value || 0, summary.currencyCode || "USD")}
                </p>
                <p className="mt-1 text-sm dark:text-slate-400" style={{ color: "var(--module-muted-text)" }}>{summaryDateLabel}</p>
                {pagination?.total ? <p className="mt-3 text-xs dark:text-slate-400" style={{ color: "var(--module-muted-text)" }}>{pagination.total} matched records</p> : null}
              </div>
            ) : null}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {!hasLoaded && loading ? (
          <div className="p-4 sm:p-6">
            <LoadingSkeleton rows={5} />
          </div>
        ) : (
          <>
            <div className="grid gap-4 p-3 sm:p-4 md:hidden">
              {items.length ? (
                items.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-border bg-card p-4 sm:rounded-3xl">
                    <div className="space-y-3">
                      {columns.map((column) => (
                        <div key={column.accessor} className="flex items-start justify-between gap-4">
                          <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">{column.label}</span>
                          <span className="text-right text-sm font-medium dark:text-slate-100" style={{ color: "var(--module-strong-text)" }}>{renderCardValue(item, column)}</span>
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
                <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-5 text-center text-sm text-slate-500 sm:p-6">No data found</div>
              )}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    {columns.map((column) => (
                      <th key={column.accessor} className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">
                        {column.label}
                      </th>
                    ))}
                    <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length ? (
                    items.map((item) => (
                      <tr key={item.id} className="border-t border-border dark:border-slate-800">
                        {columns.map((column) => (
                          <td key={column.accessor} className="px-4 py-3 text-slate-950 dark:text-slate-100">
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
                    <tr className="border-t border-border dark:border-slate-800">
                      <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
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
        <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-sm text-slate-500 sm:text-left">
            Page {pagination.page} of {pagination.totalPages || 1}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Button
              className="w-full sm:w-auto"
              variant="secondary"
              disabled={pagination.page <= 1}
              onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
            >
              Previous
            </Button>
            <Button
              className="w-full sm:w-auto"
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
              ) : field.type === "file-upload" ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">
                      <Upload className="h-4 w-4" />
                      {uploadingField === field.name ? "Uploading..." : field.uploadLabel || "Upload file"}
                      <input
                        type="file"
                        accept={field.accept || "image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"}
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            handleFileUpload(field, file);
                          }
                          event.target.value = "";
                        }}
                        disabled={uploadingField === field.name}
                      />
                    </label>
                    {form[field.name] ? (
                      <>
                        <a
                          href={form[field.name]}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium transition hover:bg-muted dark:text-slate-100"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open file
                        </a>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setForm((current) => ({ ...current, [field.name]: "" }))}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </>
                    ) : null}
                  </div>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                    value={form[field.name] ?? ""}
                    onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                    placeholder={field.placeholder || "Uploaded file URL will appear here"}
                  />
                </div>
              ) : field.type === "select" ? (
                isCurrencySelect(field) ? (
                  <SearchableSelect
                    field={field}
                    value={form[field.name] ?? ""}
                    options={field.options || lookupData[field.lookupKey] || []}
                    placeholder="Select"
                    onChange={(nextValue) => setForm((current) => ({ ...current, [field.name]: nextValue }))}
                  />
                ) : (
                  <select
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-slate-950 outline-none dark:text-slate-100"
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
                )
              ) : field.type === "textarea" ? (
                <textarea
                  className="min-h-28 w-full rounded-2xl border border-border bg-card px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                  value={form[field.name] ?? ""}
                  onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                />
              ) : (
                <input
                  type={fieldTypeToInput[field.type] || "text"}
                  step={field.type === "number" ? "0.01" : undefined}
                  className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
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
