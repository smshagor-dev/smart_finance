"use client";

import { cn } from "@/lib/utils";

export function Button({ className, variant = "primary", ...props }) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    secondary: "bg-white text-foreground border border-border hover:bg-muted",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent text-foreground hover:bg-muted",
  };

  return (
    <button
      className={cn("inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition", variants[variant], className)}
      {...props}
    />
  );
}
