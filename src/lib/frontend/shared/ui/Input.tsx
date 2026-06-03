"use client";

import { InputHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export function Input({ label, error, fullWidth, className, id, ...rest }: InputProps) {
  return (
    <div className={cn(fullWidth && "w-full")}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-xs font-medium text-gray-400">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white",
          "placeholder-gray-500 focus:border-brand-600 focus:outline-none",
          fullWidth && "w-full",
          error && "border-red-600",
          className,
        )}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
