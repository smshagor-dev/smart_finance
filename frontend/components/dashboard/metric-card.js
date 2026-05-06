import { Card } from "@/components/ui/card";

export function MetricCard({ label, value, hint, accent = "bg-primary" }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>
          <p className="mt-1 text-sm text-slate-500">{hint}</p>
        </div>
        <div className={`h-12 w-12 rounded-2xl ${accent} opacity-80`} />
      </div>
    </Card>
  );
}
