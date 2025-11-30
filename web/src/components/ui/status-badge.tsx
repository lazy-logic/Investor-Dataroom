"use client";

import type { ReactNode } from "react";

export type StatusBadgeVariant =
  | "default"
  | "success"
  | "danger"
  | "warning"
  | "muted";

interface StatusBadgeProps {
  children: ReactNode;
  variant?: StatusBadgeVariant;
  className?: string;
}

const variantClasses: Record<StatusBadgeVariant, string> = {
  default:
    "bg-slate-100 text-slate-700 border border-slate-200",
  success:
    "bg-brand-green/10 text-brand-green border border-brand-green/40",
  danger:
    "bg-brand-red/5 text-brand-red border border-brand-red/40",
  warning:
    "bg-amber-50 text-amber-700 border border-amber-200",
  muted:
    "bg-slate-50 text-slate-500 border border-slate-200",
};

export function StatusBadge({
  children,
  variant = "default",
  className,
}: StatusBadgeProps) {
  const baseClasses =
    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium";

  const classes = [baseClasses, variantClasses[variant], className]
    .filter(Boolean)
    .join(" ");

  return <span className={classes}>{children}</span>;
}
