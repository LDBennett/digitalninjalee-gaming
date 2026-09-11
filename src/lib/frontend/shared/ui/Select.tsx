"use client";

import { SelectHTMLAttributes } from "react";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "../lib/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  fullWidth?: boolean;
  error?: string;
}

export function Select({
  label,
  fullWidth,
  className,
  id,
  children,
  error,
  ...rest
}: SelectProps) {
  return (
    <div className={cn("group flex flex-col", fullWidth && "w-full")}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-xs font-medium text-gray-400 transition-colors group-focus-within:text-gray-200"
        >
          {label}
        </label>
      )}
      <div className="relative w-full">
        <select
          id={id}
          className={cn(
            "w-full cursor-pointer appearance-none rounded-lg border border-gray-700 bg-gray-900/90 py-2 pr-10 pl-3.5 text-sm font-medium text-white shadow-xs transition-all",
            "hover:border-gray-600",
            "focus:border-brand-500 focus:ring-brand-500/20 focus:ring-2 focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error &&
              "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className,
          )}
          {...rest}
        >
          {children}
        </select>
        <div className="group-focus-within:text-brand-400 pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 transition-colors group-hover:text-gray-200">
          <ChevronsUpDown size={15} strokeWidth={2} className="shrink-0" />
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
