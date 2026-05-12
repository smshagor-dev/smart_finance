import { Card } from "@/components/ui/card";

export function MetricCard({ label, value, hint, accent = "bg-primary" }) {
  return (
    <Card className="p-4 min-[390px]:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500 min-[390px]:text-[13px]">{label}</p>
          <p className="mt-2 text-xl font-semibold leading-tight text-slate-900 min-[375px]:text-2xl min-[430px]:text-[1.7rem] sm:text-3xl">{value}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500 min-[390px]:text-sm">{hint}</p>
        </div>
        <div className={`mt-0.5 h-10 w-10 shrink-0 rounded-2xl ${accent} opacity-80 min-[390px]:h-11 min-[390px]:w-11 sm:h-12 sm:w-12`} />
      </div>
    </Card>
  );
}
