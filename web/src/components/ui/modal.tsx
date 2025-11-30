"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ModalProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  size?: "sm" | "md" | "lg";
  onClose: () => void;
  children: ReactNode;
}

export function Modal({
  open,
  title,
  description,
  size = "md",
  onClose,
  children,
}: ModalProps) {
  if (!open) return null;

  const maxWidthClass =
    size === "sm" ? "max-w-md" : size === "lg" ? "max-w-2xl" : "max-w-xl";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full ${maxWidthClass} overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl animate-fade-in-up`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
            {description ? (
              <p className="text-xs text-slate-600">{description}</p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-900"
          >
            Close
          </Button>
        </div>
        <div className="px-4 py-4 text-sm text-slate-800">{children}</div>
      </div>
    </div>
  );
}
