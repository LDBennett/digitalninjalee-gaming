"use client";

import { X } from "lucide-react";

interface QuickGuideHeaderProps {
  onClose: () => void;
}

export function QuickGuideHeader({ onClose }: QuickGuideHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-800/80 px-5 py-4">
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="bg-brand-400 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
          <span className="bg-brand-500 relative inline-flex h-2.5 w-2.5 rounded-full" />
        </span>
        <h2 className="text-xs font-bold tracking-widest text-white uppercase">
          Bunker Guide
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <kbd className="border-brand-500/20 bg-brand-950/40 text-brand-400 hidden rounded-md border px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase md:inline-block">
          G
        </kbd>
        <button
          onClick={onClose}
          aria-label="Close guide"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-800 hover:text-white active:scale-95"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
