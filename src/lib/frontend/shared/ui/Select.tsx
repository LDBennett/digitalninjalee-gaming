"use client";

import { SelectHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  fullWidth?: boolean;
}

export function Select({ label, fullWidth, className, id, children, ...rest }: SelectProps) {
  return (
    <div className={cn(fullWidth && "w-full")}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-xs font-medium text-gray-400">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          "rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white",
          "focus:border-brand-600 focus:outline-none",
          fullWidth && "w-full",
          className,
        )}
        {...rest}
      >
        {children}
      </select>
    </div>
  );
}
