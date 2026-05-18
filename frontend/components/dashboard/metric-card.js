import { Landmark } from "lucide-react";
import { Card } from "@/components/ui/card";

export function MetricCard({ label, value, hint, accent = "bg-primary", icon: Icon = Landmark }) {
  return (
    <Card className="rounded-[1.8rem] p-3.5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] min-[390px]:p-4">
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 min-[390px]:text-[11px]">{label}</p>
          <p className="mt-2 text-[1.05rem] font-semibold leading-none text-slate-900 min-[375px]:text-[1.2rem] min-[430px]:text-[1.35rem]">{value}</p>
          <p className="mt-2 text-[11px] leading-4 text-slate-500 min-[390px]:text-xs">{hint}</p>
        </div>
        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[1.1rem] ${accent} shadow-sm min-[390px]:h-10 min-[390px]:w-10`}>
          <Icon className="h-4.5 w-4.5 text-white min-[390px]:h-5 min-[390px]:w-5" />
        </div>
      </div>
    </Card>
  );
}
