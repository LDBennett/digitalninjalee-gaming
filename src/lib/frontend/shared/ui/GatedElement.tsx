"use client";

import { useEffect, useRef, useState } from "react";
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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (isAuthenticated) return <>{children}</>;

  return (
    <div ref={ref} className={cx("relative", className)}>
      {children}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      />
      {open && (
        <div className="absolute top-full left-1/2 z-50 mt-2 w-44 -translate-x-1/2 rounded-lg border border-gray-700 bg-gray-900 p-3 shadow-xl">
          <p className="mb-2 text-center text-xs text-gray-400">
            This Action requires you to be signed in
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
        </div>
      )}
    </div>
  );
}
