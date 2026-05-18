"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchableSelect({ label, value, options, onChange, placeholder = "Select" }) {
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

  const normalizedOptions = (options || []).map((option) => ({
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
        className="flex w-full items-center justify-between rounded-2xl border border-border bg-white px-4 py-3 text-left outline-none transition focus:border-primary"
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
          <p className="truncate text-xs text-slate-500">{selectedOption?.symbol || `Search and choose ${label.toLowerCase()}`}</p>
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-500 transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute z-20 mt-2 w-full rounded-3xl border border-border bg-white p-3 shadow-xl">
          <div className="mb-3 flex items-center gap-2 rounded-2xl border border-border bg-slate-50 px-3 py-2">
            <Search className="h-4 w-4 text-slate-500" />
            <input className="w-full bg-transparent text-sm outline-none" placeholder={`Search ${label.toLowerCase()}`} value={search} onChange={(event) => setSearch(event.target.value)} />
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
