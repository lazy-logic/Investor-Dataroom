import type { ReactNode } from "react";

interface AlertProps {
  variant?: "success" | "error" | "info";
  children: ReactNode;
}

const variantClasses: Record<NonNullable<AlertProps["variant"]>, string> = {
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-sky-200 bg-sky-50 text-sky-800",
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
