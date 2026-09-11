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
  hideHeader?: boolean;
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
  hideHeader = false,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div
        className={cn(
          "relative flex max-h-[85vh] w-full flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl sm:max-h-[90vh]",
          maxWidth,
          className,
        )}
      >
        {overlay}

        {/* Header: either full-bleed floating close button, or pinned header bar */}
        {hideHeader ? (
          <>
            <h2 className="sr-only">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="absolute top-4 right-4 z-50 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-black/60 text-xl leading-none text-gray-400 shadow-lg backdrop-blur-md transition-all hover:bg-black/90 hover:text-white"
            >
              &times;
            </button>
          </>
        ) : (
          <div className="relative z-10 flex flex-none items-center justify-between border-b border-gray-800/80 bg-gray-950/60 px-6 py-4 backdrop-blur-md">
            <h2 className="text-base font-semibold text-white">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer text-2xl leading-none text-gray-400 transition-colors hover:text-white"
            >
              &times;
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div
          className={cn(
            "relative z-10 flex min-h-0 flex-1 flex-col",
            scrollable ? "overflow-hidden" : "overflow-visible",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
