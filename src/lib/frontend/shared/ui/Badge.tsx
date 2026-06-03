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

export function Badge({ bg, text, children, className, onClick, role, title }: BadgeProps) {
  const baseClasses = cn(
    "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
    bg,
    text,
    onClick && "cursor-pointer transition-colors",
    className,
  );

  if (onClick) {
    return (
      <button type="button" className={baseClasses} onClick={onClick} role={role} title={title}>
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
