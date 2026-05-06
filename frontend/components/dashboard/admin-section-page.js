"use client";

import { useEffect, useState } from "react";
import { Database, FolderTree, Layers3, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

const iconMap = {
  integrity: Layers3,
  access: ShieldCheck,
  finance: FolderTree,
  collaboration: Database,
  platform: Layers3,
};

export function AdminSectionPage({ section }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;

    fetch(`/api/admin/sections/${section}`)
      .then((response) => response.json())
      .then((payload) => {
        if (active) {
          setData(payload);
        }
      });

    return () => {
      active = false;
    };
  }, [section]);

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
                <p className="text-xs text-slate-500">Latest records from this table</p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-slate-600">{block.count}</span>
            </div>

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
          </Card>
        ))}
      </div>
    </div>
  );
}
