"use client";

import { Button } from "@/components/ui/button";

export function Modal({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4">
      <div className="flex min-h-full items-center justify-center">
        <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white p-6 shadow-2xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="min-w-0 text-xl font-semibold">{title}</h3>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto pr-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
