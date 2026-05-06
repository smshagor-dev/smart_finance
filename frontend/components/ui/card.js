import { cn } from "@/lib/utils";

export function Card({ className, children }) {
  return <div className={cn("rounded-3xl border border-border bg-card shadow-sm", className)}>{children}</div>;
}
