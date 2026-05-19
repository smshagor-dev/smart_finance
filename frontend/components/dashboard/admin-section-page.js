"use client";

import { useEffect, useState } from "react";
import { Database, FolderTree, Layers3, Search, ShieldCheck, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Button } from "@/components/ui/button";

const iconMap = {
  integrity: Layers3,
  access: ShieldCheck,
  finance: FolderTree,
  collaboration: Database,
  platform: Layers3,
};

export function AdminSectionPage({ section }) {
  const [data, setData] = useState(null);
  const [blockState, setBlockState] = useState({});

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    Object.entries(blockState).forEach(([key, value]) => {
      if (value?.page) {
        params.set(`${key}Page`, String(value.page));
      }
      if (value?.search) {
        params.set(`${key}Search`, value.search);
      }
    });

    fetch(`/api/admin/sections/${section}${params.toString() ? `?${params.toString()}` : ""}`)
      .then((response) => response.json())
      .then((payload) => {
        if (active) {
          setData(payload);
        }
      });

    return () => {
      active = false;
    };
  }, [blockState, section]);

  if (!data) {
    return <LoadingSkeleton rows={12} />;
  }

  const Icon = iconMap[section] || Database;

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 p-6 text-white">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
              <Icon className="h-3.5 w-3.5" />
              {data.title}
            </div>
            <h3 className="mt-4 text-3xl font-semibold">{data.title}</h3>
            <p className="mt-2 text-sm text-cyan-50/80">{data.description}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 text-sm text-cyan-50/85">
            Each table block below is scoped to this admin area so you can review records without jumping across pages.
          </div>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.highlights?.map((item) => (
          <Card key={item.label} className="p-5">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold">{item.value}</p>
            <p className="mt-2 text-xs text-slate-400">{item.hint}</p>
          </Card>
        ))}
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {data.blocks?.map((block) => (
          <Card key={`${section}-${block.title}`} className="overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <h4 className="font-semibold">{block.title}</h4>
                <p className="text-xs text-slate-500">
                  {block.pagination?.pageSize ? `${block.pagination.pageSize} per page with search filter` : "Latest records from this table"}
                </p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-slate-600">{block.count}</span>
            </div>

            {section === "finance" ? (
              <div className="border-b border-border px-5 py-4">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    className="w-full rounded-2xl border border-border bg-card py-3 pl-11 pr-11 text-sm outline-none transition placeholder:text-slate-500 focus:border-primary"
                    placeholder={`Search ${block.title.toLowerCase()}`}
                    value={blockState[block.key]?.search ?? block.search ?? ""}
                    onChange={(event) =>
                      setBlockState((current) => ({
                        ...current,
                        [block.key]: {
                          page: 1,
                          search: event.target.value,
                        },
                      }))
                    }
                  />
                  {blockState[block.key]?.search || block.search ? (
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-muted hover:text-slate-700"
                      onClick={() =>
                        setBlockState((current) => ({
                          ...current,
                          [block.key]: {
                            page: 1,
                            search: "",
                          },
                        }))
                      }
                      aria-label={`Clear ${block.title} search`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                </label>
              </div>
            ) : null}

            {block.rows?.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-muted/60">
                    <tr>
                      {block.columns.map((column) => (
                        <th key={column} className="px-4 py-3 font-medium text-slate-600">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, index) => (
                      <tr key={`${block.title}-${index}`} className="border-t border-border align-top">
                        {row.map((cell, cellIndex) => (
                          <td key={`${block.title}-${index}-${cellIndex}`} className="px-4 py-3 text-slate-700">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-sm text-slate-500">{block.emptyMessage}</div>
            )}

            {section === "finance" && block.pagination ? (
              <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Page {block.pagination.page} of {block.pagination.totalPages || 1}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:flex">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full sm:w-auto"
                    disabled={block.pagination.page <= 1}
                    onClick={() =>
                      setBlockState((current) => ({
                        ...current,
                        [block.key]: {
                          page: Math.max(1, (current[block.key]?.page || block.pagination.page) - 1),
                          search: current[block.key]?.search ?? block.search ?? "",
                        },
                      }))
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full sm:w-auto"
                    disabled={block.pagination.page >= block.pagination.totalPages}
                    onClick={() =>
                      setBlockState((current) => ({
                        ...current,
                        [block.key]: {
                          page: Math.min(block.pagination.totalPages, (current[block.key]?.page || block.pagination.page) + 1),
                          search: current[block.key]?.search ?? block.search ?? "",
                        },
                      }))
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
