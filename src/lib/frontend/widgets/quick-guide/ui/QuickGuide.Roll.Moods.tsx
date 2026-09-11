"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MoodDto } from "@/src/lib/backend/backlog/domain/models";
import { MoodBadge } from "@/src/lib/frontend/entities/game";

const COLLAPSED_LIMIT = 8;

interface QuickGuideRollMoodsProps {
  moods: MoodDto[];
  selectedMoods: string[];
  onToggleMood: (name: string) => void;
  onClearMoods: () => void;
  disabled?: boolean;
}

export function QuickGuideRollMoods({
  moods,
  selectedMoods,
  onToggleMood,
  onClearMoods,
  disabled = false,
}: QuickGuideRollMoodsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Pin selected moods first so they never hide when collapsed
  const { visibleMoods, hiddenCount } = useMemo(() => {
    const selected = moods.filter((m) => selectedMoods.includes(m.name));
    const unselected = moods.filter((m) => !selectedMoods.includes(m.name));

    if (isExpanded) {
      return { visibleMoods: [...selected, ...unselected], hiddenCount: 0 };
    }

    const remainingSlots = Math.max(0, COLLAPSED_LIMIT - selected.length);
    const visibleUnselected = unselected.slice(0, remainingSlots);
    const hidden = unselected.length - visibleUnselected.length;

    return {
      visibleMoods: [...selected, ...visibleUnselected],
      hiddenCount: Math.max(0, hidden),
    };
  }, [moods, selectedMoods, isExpanded]);

  if (moods.length === 0) return null;

  return (
    <div className="space-y-1.5">
      {/* Header telemetry: Count & Clear */}
      <div className="flex items-center justify-between px-0.5 text-[11px] font-medium text-gray-400">
        <span>
          Moods{" "}
          {selectedMoods.length > 0 && (
            <span className="text-brand-300 font-semibold">
              ({selectedMoods.length} active)
            </span>
          )}
        </span>
        {selectedMoods.length > 0 && (
          <button
            type="button"
            onClick={onClearMoods}
            disabled={disabled}
            className="cursor-pointer text-[10px] text-gray-400 transition-colors hover:text-red-400 disabled:opacity-50"
          >
            Clear
          </button>
        )}
      </div>

      {/* Mood badges cloud */}
      <div className="flex flex-wrap items-center gap-1">
        {visibleMoods.map((mood) => {
          const active = selectedMoods.includes(mood.name);
          return (
            <button
              key={mood.id}
              type="button"
              onClick={() => onToggleMood(mood.name)}
              disabled={disabled}
              className={`cursor-pointer transition-all duration-150 active:scale-95 disabled:pointer-events-none ${
                active
                  ? "scale-105 ring-1 ring-emerald-400/90 shadow-sm shadow-emerald-500/20"
                  : "opacity-45 hover:opacity-85"
              }`}
            >
              <MoodBadge mood={mood.name} />
            </button>
          );
        })}

        {/* Expand / Collapse toggle pill */}
        {hiddenCount > 0 && !isExpanded && (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            disabled={disabled}
            className="flex cursor-pointer items-center gap-1 rounded-full border border-gray-700 bg-gray-800/80 px-2.5 py-0.5 text-[11px] font-medium text-gray-300 transition-colors hover:border-gray-600 hover:text-white active:scale-95"
          >
            <span>+{hiddenCount} more</span>
            <ChevronDown size={12} />
          </button>
        )}

        {isExpanded && moods.length > COLLAPSED_LIMIT && (
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            disabled={disabled}
            className="flex cursor-pointer items-center gap-1 rounded-full border border-gray-700 bg-gray-800/80 px-2.5 py-0.5 text-[11px] font-medium text-gray-400 transition-colors hover:border-gray-600 hover:text-white active:scale-95"
          >
            <span>Show less</span>
            <ChevronUp size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
