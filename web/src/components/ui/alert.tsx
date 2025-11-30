import type { ReactNode } from "react";

interface AlertProps {
  variant?: "success" | "error" | "info";
  children: ReactNode;
}

const variantClasses: Record<NonNullable<AlertProps["variant"]>, string> = {
  success:
    "border-brand-green/40 bg-brand-green/5 text-brand-green",
  error: "border-brand-red/40 bg-brand-red/5 text-brand-red",
  info: "border-slate-300 bg-slate-50 text-slate-800",
};

export function Alert({ variant = "info", children }: AlertProps) {
  return (
    <div
      className={`w-full rounded-lg border px-3 py-2 text-sm ${variantClasses[variant]}`}
    >
      {children}
    </div>
  );
}
