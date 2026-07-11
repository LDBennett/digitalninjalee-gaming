"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroCardControlsProps {
  total: number;
  idx: number;
  onDot: (i: number) => void;
  onGo: (delta: number) => void;
}

export function HeroCardControls({
  total,
  idx,
  onDot,
  onGo,
}: HeroCardControlsProps) {
  if (total <= 1) return null;

  return (
    <div className="absolute right-4 bottom-4 flex items-center gap-2">
      {/* Desktop: dot indicators */}
      <div className="hidden items-center gap-1.5 sm:flex">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            onClick={() => onDot(i)}
            className={`h-1.5 rounded-full transition-all ${i === idx ? "w-4 bg-white" : "w-1.5 bg-gray-600 hover:bg-gray-400"}`}
            aria-label={`Go to game ${i + 1}`}
          />
        ))}
      </div>

      {/* Mobile: compact counter */}
      <span className="text-xs font-medium text-gray-300 sm:hidden">
        {idx + 1}/{total}
      </span>

      <button
        onClick={() => onGo(-1)}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-800/80 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
        aria-label="Previous game"
      >
        <ChevronLeft size={14} />
      </button>
      <button
        onClick={() => onGo(1)}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-800/80 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
        aria-label="Next game"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
