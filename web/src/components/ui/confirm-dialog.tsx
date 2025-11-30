"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl animate-fade-in-up">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-red/10 text-[11px] font-semibold text-brand-red">
            !
          </div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        </div>
        {description ? (
          <div className="px-4 py-3 text-xs text-slate-600">{description}</div>
        ) : null}
        <div className="flex justify-end gap-2 border-t border-slate-100 px-4 py-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={loading ? undefined : onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={loading ? undefined : onConfirm}
            disabled={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
