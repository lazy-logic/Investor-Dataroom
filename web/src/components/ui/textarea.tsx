"use client";

import * as React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    const id = React.useId();

    return (
      <div className="flex flex-col gap-1">
        {label ? (
          <label
            htmlFor={id}
            className="text-sm font-medium text-slate-800"
          >
            {label}
          </label>
        ) : null}
        <textarea
          id={id}
          ref={ref}
          className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:border-brand-red disabled:cursor-not-allowed disabled:bg-slate-100 ${
            error ? "border-red-500" : "border-slate-300"
          } ${className ?? ""}`}
          {...props}
        />
        {error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
