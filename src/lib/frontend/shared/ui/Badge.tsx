import { ReactNode } from "react";
import { cn } from "../lib/cn";

export interface BadgeProps {
  bg: string;
  text: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  role?: string;
  title?: string;
}

export function Badge({
  bg,
  text,
  children,
  className,
  onClick,
  role,
  title,
}: BadgeProps) {
  const baseClasses = cn(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border border-transparent transition-all",
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
