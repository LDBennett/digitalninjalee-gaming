"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type ButtonVariant = "brand" | "brand-gradient" | "gray" | "gray-dark" | "danger" | "ghost";
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
  brand: "bg-brand-700 hover:bg-brand-600 text-white",
  "brand-gradient":
    "bg-linear-to-r from-brand-950 to-brand-800 hover:from-brand-800 hover:to-brand-600 text-white shadow-lg",
  gray: "bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white",
  "gray-dark": "bg-gray-700 hover:bg-gray-600 text-white",
  danger: "bg-red-900/60 hover:bg-red-800/60 text-red-300",
  ghost: "text-gray-400 hover:text-white",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  xs: "px-2.5 py-1 text-xs",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-sm",
};

const SHAPE_CLASSES: Record<ButtonShape, string> = {
  rounded: "rounded-lg",
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
        "inline-flex items-center justify-center gap-2 font-semibold transition-colors",
        "disabled:cursor-not-allowed disabled:bg-gray-800 disabled:text-gray-500 disabled:shadow-none",
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
