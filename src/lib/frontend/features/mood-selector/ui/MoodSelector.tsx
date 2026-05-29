"use client";

import { MoodDto } from "@/src/lib/backend/backlog/domain/models";
import { MoodBadge } from "@/src/lib/frontend/entities/mood";

interface MoodSelectorProps {
  moods: MoodDto[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function MoodSelector({
  moods,
  selectedIds,
  onToggle,
}: MoodSelectorProps) {
  return (
    <div>
      <label className="block mb-2 font-medium text-gray-400 text-xs">
        Mood Tags
      </label>
      <div className="flex flex-wrap gap-2">
        {moods.map((mood) => (
          <button
            key={mood.id}
            type="button"
            onClick={() => onToggle(mood.id)}
            className={`transition-all duration-150 ${
              selectedIds.includes(mood.id)
                ? "ring-2 ring-brand-500/40 scale-105"
                : "opacity-40 hover:opacity-70"
            }`}
          >
            <MoodBadge mood={mood.name} />
          </button>
        ))}
      </div>
    </div>
  );
}
