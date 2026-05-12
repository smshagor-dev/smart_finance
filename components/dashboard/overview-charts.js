"use client";

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const palette = ["#0f766e", "#15803d", "#2563eb", "#dc2626", "#d97706", "#7c3aed"];

export function OverviewCharts({ categoryData, trendData }) {
  return (
    <div className="grid gap-4 sm:gap-6 xl:grid-cols-2">
      <Card className="p-4 min-[390px]:p-5">
        <div className="mb-3 min-[390px]:mb-4">
          <h3 className="text-base font-semibold min-[390px]:text-lg">Expense by Category</h3>
          <p className="text-xs text-slate-500 min-[390px]:text-sm">See where most of your money goes.</p>
        </div>
        <div className="h-56 min-[375px]:h-60 min-[430px]:h-64 sm:h-72">
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
        </div>
      </Card>

      <Card className="p-4 min-[390px]:p-5">
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
    </div>
  );
}
