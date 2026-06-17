"use client";

import { useRef, useState, useEffect } from "react";
import { Ghost, LogIn, Shield } from "lucide-react";
import { useAuthStore } from "@/src/lib/frontend/shared/store/auth.store";

export function NavigationAuthIcon() {
  const { user, openLoginModal, openSignOutConfirm } = useAuthStore();
  const [showPanel, setShowPanel] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showPanel) return;
    const handler = (e: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowPanel(false);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [showPanel]);

  if (user) {
    return (
      <button
        onClick={openSignOutConfirm}
        className="relative shrink-0 cursor-pointer p-1"
        aria-label="Sign out"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-green-400">
          <Shield size={16} />
        </div>
        <span className="absolute right-0.5 bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-gray-950 bg-green-500" />
      </button>
    );
  }

  return (
    <div ref={wrapperRef} className="relative shrink-0">
      <button
        onClick={() => setShowPanel((p) => !p)}
        className="relative cursor-pointer p-1"
        aria-label="Ghost mode — tap to sign in"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800">
          <Ghost size={16} className="text-gray-400" />
        </div>
        <span className="absolute right-0.5 bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-gray-950 bg-gray-500" />
      </button>

      {showPanel && (
        <button
          onClick={() => { openLoginModal(); setShowPanel(false); }}
          className="absolute top-12 right-0 z-50 flex cursor-pointer items-center gap-3 rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-left shadow-xl transition-colors hover:bg-gray-700"
        >
          <Ghost size={18} className="shrink-0 text-gray-400" />
          <div>
            <p className="whitespace-nowrap text-sm font-semibold text-white">Ghost Mode</p>
            <p className="flex items-center gap-1 whitespace-nowrap text-xs text-brand-400">
              <LogIn size={11} /> Click to Sign In
            </p>
          </div>
        </button>
      )}
    </div>
  );
}
