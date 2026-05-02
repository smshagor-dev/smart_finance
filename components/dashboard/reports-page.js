"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OverviewCharts } from "@/components/dashboard/overview-charts";
import { useLiveUpdateListener } from "@/lib/live-client";
import { formatCurrency } from "@/lib/utils";

export function ReportsPage() {
  const [data, setData] = useState(null);

  async function loadReports() {
    const response = await fetch("/api/dashboard/reports");
    const payload = await response.json();
    setData(payload);
  }

  useEffect(() => {
    let cancelled = false;

    fetch("/api/dashboard/reports")
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

  useLiveUpdateListener(["reports"], () => {
    loadReports();
  });

  async function exportFile(format) {
    window.open(`/api/exports/${format}`, "_blank");
  }

  if (!data) {
    return <div className="animate-pulse rounded-3xl bg-muted p-16" />;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Reports & Analytics</h2>
            <p className="mt-1 text-sm text-slate-500">Daily, weekly, monthly, and yearly finance reporting with exports.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => exportFile("csv")}>
              Export CSV
            </Button>
            <Button variant="secondary" onClick={() => exportFile("excel")}>
              Export Excel
            </Button>
            <Button variant="secondary" onClick={() => exportFile("json")}>
              Backup JSON
            </Button>
            <Button onClick={() => exportFile("pdf")}>Export PDF</Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.summary.map((item) => (
          <Card key={item.label} className="p-5">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold">{formatCurrency(item.value, data.currencyCode || "USD")}</p>
          </Card>
        ))}
      </div>

      <OverviewCharts categoryData={data.categorySpending} trendData={data.monthlyTrend} />
    </div>
  );
}
