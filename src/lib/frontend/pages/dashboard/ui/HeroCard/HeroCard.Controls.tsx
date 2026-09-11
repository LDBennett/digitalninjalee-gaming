"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/src/lib/frontend/shared";

interface HeroCardControlsProps {
  total: number;
  idx: number;
  isManuallyPaused: boolean;
  onDot: (i: number) => void;
  onGo: (delta: number) => void;
  onTogglePause: () => void;
  className?: string;
}

export function HeroCardControls({
  total,
  idx,
  isManuallyPaused,
  onDot,
  onGo,
  onTogglePause,
  className,
}: HeroCardControlsProps) {
  if (total <= 1) return null;

  const showDots = total <= 6;

  return (
    <div
      className={cn(
        "absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-gray-950/85 px-2.5 py-1 backdrop-blur-md shadow-lg md:top-6 md:right-6",
        className
      )}
    >
      {/* Explicit WCAG 2.2.2 Autoplay Pause/Play Toggle */}
      <button
        type="button"
        onClick={onTogglePause}
        className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
        aria-label={
          isManuallyPaused
            ? "Resume carousel autoplay"
            : "Pause carousel autoplay"
        }
      >
        {isManuallyPaused ? <Play size={11} /> : <Pause size={11} />}
      </button>

      {/* Slide Indicators: Dots if <= 6, Compact Counter if > 6 */}
      {showDots ? (
        <div className="hidden items-center gap-1.5 sm:flex">
          {Array.from({ length: total }, (_, i) => (
            <button
              type="button"
              key={i}
              onClick={() => onDot(i)}
              className={`h-1.5 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                i === idx
                  ? "w-4 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
                  : "w-1.5 bg-gray-600 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      ) : null}

      {/* Counter displayed when > 6 slides or on mobile viewports */}
      <span
        className={cn(
          "text-[11px] font-medium text-gray-300",
          showDots ? "sm:hidden" : "px-1"
        )}
      >
        {idx + 1}/{total}
      </span>

      {/* Prev / Next Chevrons */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => onGo(-1)}
          className="flex h-6 w-6 items-center justify-center rounded-full text-gray-300 transition-all hover:bg-white/10 hover:text-white active:scale-90 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
          aria-label="Previous game"
        >
          <ChevronLeft size={13} />
        </button>
        <button
          type="button"
          onClick={() => onGo(1)}
          className="flex h-6 w-6 items-center justify-center rounded-full text-gray-300 transition-all hover:bg-white/10 hover:text-white active:scale-90 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
          aria-label="Next game"
        >
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}
