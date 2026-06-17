"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";
import cx from "classnames";

interface GatedElementProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  onSignIn: () => void;
  className?: string;
}

export function GatedElement({
  children,
  isAuthenticated,
  onSignIn,
  className,
}: GatedElementProps) {
  const [open, setOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const inTrigger = triggerRef.current?.contains(e.target as Node);
      const inPopover = popoverRef.current?.contains(e.target as Node);
      if (!inTrigger && !inPopover) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (isAuthenticated) return <>{children}</>;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const POPOVER_W = 176; // w-44
      const centered = rect.left + rect.width / 2 - POPOVER_W / 2;
      const rightAnchored = rect.right - POPOVER_W;
      const nearRightEdge = rect.right > window.innerWidth - POPOVER_W;
      const left = Math.max(8, nearRightEdge ? rightAnchored : centered);
      setPopoverPos({ top: rect.bottom + 8, left });
    }
    setOpen(true);
  };

  return (
    <div ref={triggerRef} className={cx("relative", className)}>
      {children}
      <div className="absolute inset-0 cursor-pointer" onClick={handleClick} />
      {open &&
        createPortal(
          <div
            ref={popoverRef}
            style={{ top: popoverPos.top, left: popoverPos.left }}
            className="fixed z-9999 w-44 rounded-lg border border-gray-700 bg-gray-900 p-3 shadow-xl"
          >
            <p className="mb-2 text-center text-xs text-gray-400">
              This action requires you to be signed in
            </p>
            <Button
              size="xs"
              variant="brand"
              onClick={() => {
                onSignIn();
                setOpen(false);
              }}
              fullWidth
            >
              Sign in
            </Button>
          </div>,
          document.body,
        )}
    </div>
  );
}
