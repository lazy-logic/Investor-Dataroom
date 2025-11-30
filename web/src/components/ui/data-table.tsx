"use client";

import type { ReactNode } from "react";

interface DataTableProps {
  columns: string[];
  children: ReactNode;
  className?: string;
}

export function DataTable({ columns, children, className }: DataTableProps) {
  return (
    <div
      className={`overflow-x-auto rounded-lg border border-slate-200 bg-white/50 ${
        className ?? ""
      }`}
    >
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b bg-slate-50 text-xs font-medium text-slate-500">
            {columns.map((column) => (
              <th key={column} className="px-3 py-2">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {children}
        </tbody>
      </table>
    </div>
  );
}
