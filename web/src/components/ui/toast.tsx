"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type ToastVariant = "success" | "error" | "info";

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
}

interface Toast extends ToastOptions {
  id: number;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const el = document.createElement("div");
    document.body.appendChild(el);
    setPortalElement(el);
    return () => {
      el.remove();
    };
  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    setToasts((current) => {
      const next: Toast = {
        id: Date.now() + Math.random(),
        variant: options.variant ?? "info",
        title: options.title,
        description: options.description,
        durationMs: options.durationMs ?? 3500,
      };
      return [...current, next];
    });
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) =>
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== toast.id));
      }, toast.durationMs ?? 3500),
    );

    return () => {
      for (const id of timers) clearTimeout(id);
    };
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {portalElement
        ? createPortal(
            <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-end px-4 py-6 sm:items-start sm:justify-end">
              <div className="flex w-full flex-col items-center space-y-2 sm:items-end">
                {toasts.map((toast) => (
                  <div
                    key={toast.id}
                    className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border border-slate-200 bg-white/95 shadow-lg ring-1 ring-black/5 backdrop-blur-sm animate-fade-in-up transition-transform"
                  >
                    <div className="p-3">
                      {toast.title && (
                        <p className="text-sm font-medium text-slate-900">
                          {toast.title}
                        </p>
                      )}
                      {toast.description && (
                        <p className="mt-1 text-xs text-slate-600">
                          {toast.description}
                        </p>
                      )}
                    </div>
                    <div
                      className={`h-0.5 w-full ${
                        toast.variant === "success"
                          ? "bg-brand-green"
                          : toast.variant === "error"
                          ? "bg-brand-red"
                          : "bg-brand-red/70"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>,
            portalElement,
          )
        : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
