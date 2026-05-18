"use client";

import { createContext, useContext, useMemo } from "react";
import { toast as sonnerToast } from "sonner";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const value = useMemo(
    () => ({
      push(message, type = "success") {
        const content = typeof message === "string" ? message.trim() : "";
        const safeMessage = content || (type === "error" ? "Something went wrong" : "Done");

        if (type === "error") {
          sonnerToast.error(safeMessage, {
            duration: 4200,
          });
          return;
        }

        sonnerToast.success(safeMessage, {
          duration: 3200,
        });
      },
    }),
    [],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return value;
}
