"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "../lib/cn";

export interface NumberInputProps {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  suffix?: string;
  label?: string;
  accentColor?: "brand" | "sky" | "amber";
  disabled?: boolean;
  className?: string;
  id?: string;
  ariaLabel?: string;
}

const ACCENT_STYLES = {
  brand: {
    container:
      "focus-within:border-brand-500/80 focus-within:ring-1 focus-within:ring-brand-500/30",
    button: "hover:bg-brand-950/40 hover:text-brand-300 active:bg-brand-900/50",
    suffix: "text-brand-400/80",
  },
  sky: {
    container:
      "focus-within:border-sky-500/80 focus-within:ring-1 focus-within:ring-sky-500/30",
    button: "hover:bg-sky-950/40 hover:text-sky-300 active:bg-sky-900/50",
    suffix: "text-sky-400/80",
  },
  amber: {
    container:
      "focus-within:border-amber-500/80 focus-within:ring-1 focus-within:ring-amber-500/30",
    button: "hover:bg-amber-950/40 hover:text-amber-300 active:bg-amber-900/50",
    suffix: "text-amber-400/80",
  },
};

function roundToStep(val: number, stepVal: number): number {
  const decimals = stepVal.toString().split(".")[1]?.length ?? 0;
  const factor = 10 ** decimals;
  return Math.round(val * factor) / factor;
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  placeholder,
  suffix,
  label,
  accentColor = "brand",
  disabled = false,
  className,
  id,
  ariaLabel,
}: NumberInputProps) {
  const styles = ACCENT_STYLES[accentColor];

  const handleIncrement = () => {
    if (disabled) return;
    const current = value ?? min ?? 0;
    const next = roundToStep(current + step, step);
    if (max !== undefined && next > max) return;
    onChange(next);
  };

  const handleDecrement = () => {
    if (disabled) return;
    const current = value ?? min ?? 0;
    const next = roundToStep(current - step, step);
    if (min !== undefined && next < min) return;
    onChange(next);
  };

  const isDecDisabled =
    disabled ||
    (min !== undefined && value !== null && value !== undefined && value <= min);
  const isIncDisabled =
    disabled ||
    (max !== undefined && value !== null && value !== undefined && value >= max);

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1 block text-[10px] font-medium tracking-wide text-gray-400"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          "group flex h-8 items-stretch rounded-lg border border-gray-800 bg-gray-900/80 transition-all duration-150",
          "hover:border-gray-700/80",
          styles.container,
          disabled && "opacity-50 pointer-events-none",
        )}
      >
        <button
          type="button"
          tabIndex={-1}
          onClick={handleDecrement}
          disabled={isDecDisabled}
          aria-label={`Decrease ${label ?? ariaLabel ?? "value"}`}
          className={cn(
            "flex w-6.5 shrink-0 items-center justify-center rounded-l-lg text-gray-400 transition-colors select-none",
            "active:scale-95 disabled:pointer-events-none disabled:opacity-20",
            styles.button,
          )}
        >
          <Minus size={11} strokeWidth={2.5} />
        </button>

        <div className="relative flex min-w-0 flex-1 items-center justify-center">
          <input
            id={id}
            type="number"
            value={value ?? ""}
            min={min}
            max={max}
            step={step}
            placeholder={placeholder}
            disabled={disabled}
            aria-label={ariaLabel ?? label}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") {
                onChange(null);
              } else {
                const parsed = parseFloat(raw);
                onChange(isNaN(parsed) ? null : parsed);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                handleIncrement();
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                handleDecrement();
              }
            }}
            className="w-full bg-transparent px-1 text-center text-xs font-semibold text-white placeholder-gray-600 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          {suffix && value !== null && value !== undefined && (
            <span
              className={cn(
                "pointer-events-none -ml-0.5 mr-1 text-[10px] font-medium select-none",
                styles.suffix,
              )}
            >
              {suffix}
            </span>
          )}
        </div>

        <button
          type="button"
          tabIndex={-1}
          onClick={handleIncrement}
          disabled={isIncDisabled}
          aria-label={`Increase ${label ?? ariaLabel ?? "value"}`}
          className={cn(
            "flex w-6.5 shrink-0 items-center justify-center rounded-r-lg text-gray-400 transition-colors select-none",
            "active:scale-95 disabled:pointer-events-none disabled:opacity-20",
            styles.button,
          )}
        >
          <Plus size={11} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
