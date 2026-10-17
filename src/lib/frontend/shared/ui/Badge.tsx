import { ReactNode } from "react";
import { cn } from "../lib/cn";

export interface BadgeProps {
  bg: string;
  text: string;
  children: ReactNode;
  variant?: "capsule" | "chip";
  className?: string;
  onClick?: () => void;
  role?: string;
  title?: string;
}

export function Badge({
  bg,
  text,
  children,
  variant = "capsule",
  className,
  onClick,
  role,
  title,
}: BadgeProps) {
  const shapeClasses =
    variant === "chip"
      ? "rounded-md px-2 py-0.5 text-[11px]"
      : "rounded-full px-2.5 py-0.5 text-xs";

  const baseClasses = cn(
    "inline-flex items-center font-medium border border-transparent transition-all",
    shapeClasses,
    bg,
    text,
    onClick && "cursor-pointer select-none active:scale-95 hover:brightness-110",
    className,
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={baseClasses}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        role={role}
        title={title}
      >
        {children}
      </button>
    );
  }

  return (
    <span className={baseClasses} role={role} title={title}>
      {children}
    </span>
  );
}
