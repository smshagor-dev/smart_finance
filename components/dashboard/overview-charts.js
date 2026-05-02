"use client";

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const palette = ["#0f766e", "#15803d", "#2563eb", "#dc2626", "#d97706", "#7c3aed"];

export function OverviewCharts({ categoryData, trendData }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Expense by Category</h3>
          <p className="text-sm text-slate-500">See where most of your money goes.</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100}>
                {categoryData.map((entry, index) => (
                  <Cell key={entry.name} fill={palette[index % palette.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Monthly Income vs Expense</h3>
          <p className="text-sm text-slate-500">Track earnings and spending month over month.</p>
        </div>
        <div className="h-72">
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
