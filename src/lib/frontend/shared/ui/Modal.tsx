"use client";

import { ReactNode, useEffect } from "react";
import { cn } from "../lib/cn";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  maxWidth?: string;
  scrollable?: boolean;
  overlay?: ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
  scrollable = false,
  overlay,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl",
          maxWidth,
          className,
        )}
      >
        {overlay}

        <div className={cn("relative", scrollable && "max-h-[90vh] overflow-y-auto")}>
          <div className="flex items-center justify-between border-b border-gray-800 p-5">
            <h2 className="text-base font-semibold text-white">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-2xl leading-none text-gray-400 transition-colors hover:text-white"
            >
              &times;
            </button>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
