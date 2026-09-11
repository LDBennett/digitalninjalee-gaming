"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type ButtonVariant =
  | "brand"
  | "brand-gradient"
  | "gray"
  | "gray-dark"
  | "danger"
  | "ghost";
export type ButtonSize = "xs" | "sm" | "md" | "lg";
export type ButtonShape = "rounded" | "pill";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  brand:
    "bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white shadow-sm shadow-brand-950/50 border border-brand-500/30 hover:border-brand-400/50",
  "brand-gradient":
    "bg-linear-to-r from-brand-700 to-brand-600 hover:from-brand-600 hover:to-brand-500 text-white shadow-md shadow-brand-950/40 border border-brand-500/20",
  gray: "bg-gray-800/80 hover:bg-gray-700/90 text-gray-300 hover:text-white border border-white/5 hover:border-white/10",
  "gray-dark":
    "bg-gray-800/90 hover:bg-gray-700 text-gray-200 hover:text-white border border-white/10 hover:border-white/20",
  danger:
    "bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40",
  ghost: "text-gray-400 hover:text-white hover:bg-white/5",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  xs: "px-2.5 py-1 text-xs",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-sm",
};

const SHAPE_CLASSES: Record<ButtonShape, string> = {
  rounded: "rounded-xl",
  pill: "rounded-full",
};

export function Button({
  variant = "brand",
  size = "md",
  shape = "rounded",
  fullWidth,
  icon,
  iconRight,
  children,
  className,
  type,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 active:scale-[0.97] select-none",
        "disabled:cursor-not-allowed disabled:bg-gray-800/60 disabled:text-gray-500 disabled:border-transparent disabled:shadow-none disabled:active:scale-100",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        SHAPE_CLASSES[shape],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}
