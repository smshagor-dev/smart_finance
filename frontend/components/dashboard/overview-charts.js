"use client";

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const palette = ["#0f766e", "#15803d", "#2563eb", "#dc2626", "#d97706", "#7c3aed"];

export function OverviewCharts({ categoryData, incomeCategoryData = [], trendData, comparisonData = [] }) {
  return (
    <div className="grid gap-4 sm:gap-6 xl:grid-cols-2">
      <Card className="p-4 min-[390px]:p-5 xl:col-span-1">
        <div className="mb-3 min-[390px]:mb-4">
          <h3 className="text-base font-semibold min-[390px]:text-lg">Income by Category</h3>
          <p className="text-xs text-slate-500 min-[390px]:text-sm">See which income sources contribute the most.</p>
        </div>
        <div className="h-56 min-[375px]:h-60 min-[430px]:h-64 sm:h-72">
          {incomeCategoryData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={incomeCategoryData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={84}>
                  {incomeCategoryData.map((entry, index) => (
                    <Cell key={entry.name} fill={palette[index % palette.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 px-4 text-center text-sm text-slate-500">
              Add income records with categories to see this chart.
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4 min-[390px]:p-5">
        <div className="mb-3 min-[390px]:mb-4">
          <h3 className="text-base font-semibold min-[390px]:text-lg">Expense by Category</h3>
          <p className="text-xs text-slate-500 min-[390px]:text-sm">See where most of your money goes overall.</p>
        </div>
        <div className="h-56 min-[375px]:h-60 min-[430px]:h-64 sm:h-72">
          {categoryData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={84}>
                  {categoryData.map((entry, index) => (
                    <Cell key={entry.name} fill={palette[index % palette.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 px-4 text-center text-sm text-slate-500">
              Add expense records with categories to see this chart.
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4 min-[390px]:p-5 xl:col-span-2">
        <div className="mb-3 min-[390px]:mb-4">
          <h3 className="text-base font-semibold min-[390px]:text-lg">Monthly Income vs Expense</h3>
          <p className="text-xs text-slate-500 min-[390px]:text-sm">Track earnings and spending month over month.</p>
        </div>
        <div className="h-56 min-[375px]:h-60 min-[430px]:h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="income" fill="#15803d" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expense" fill="#dc2626" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {comparisonData.length ? (
        <Card className="p-4 min-[390px]:p-5 xl:col-span-2">
          <div className="mb-3 min-[390px]:mb-4">
            <h3 className="text-base font-semibold min-[390px]:text-lg">Last Month vs This Month</h3>
            <p className="text-xs text-slate-500 min-[390px]:text-sm">Compare income and expense between the previous and current month.</p>
          </div>
          <div className="h-52 min-[375px]:h-56 min-[430px]:h-60 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="income" fill="#15803d" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expense" fill="#dc2626" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
