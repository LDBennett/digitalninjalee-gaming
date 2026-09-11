"use client";

import { Gamepad2 } from "lucide-react";
import { useQuickGuideStore } from "@/src/lib/frontend/shared";
import { NavigationAuthIcon } from "./Navigation.AuthIcon";

export function NavigationMobileHeader() {
  const { isOpen: isGuideOpen, toggleGuide } = useQuickGuideStore();

  return (
    <header className="fixed top-0 right-0 left-0 z-40 flex h-12 items-center justify-between border-b border-gray-800 bg-gray-950 px-4 md:hidden">
      <span className="text-base font-bold tracking-tight text-white">
        DigitalNinjaLee
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleGuide}
          aria-label="Open Bunker Guide"
          title="Bunker Guide"
          className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition-all active:scale-95 ${
            isGuideOpen
              ? "border-brand-500/50 bg-brand-950/80 text-brand-300 shadow-[0_0_10px_rgba(16,185,129,0.25)]"
              : "border-gray-800 bg-gray-900/90 text-gray-400 hover:border-gray-700 hover:text-white"
          }`}
        >
          <Gamepad2 size={16} />
        </button>
        <NavigationAuthIcon />
      </div>
    </header>
  );
}
