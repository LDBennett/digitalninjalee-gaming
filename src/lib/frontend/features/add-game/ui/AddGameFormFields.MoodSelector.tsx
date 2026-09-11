"use client";

import { MoodDto } from "@/src/lib/backend/backlog/domain/models";
import { getMoodStyle } from "@/src/lib/frontend/entities/game";

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
      <label className="mb-2 block text-xs font-medium text-gray-400">
        Mood Tags
      </label>
      <div className="flex flex-wrap gap-2">
        {moods.map((mood) => {
          const isSelected = selectedIds.includes(mood.id);
          const style = getMoodStyle(mood.name);
          const bg = style?.bg ?? "bg-gray-800";
          const text = style?.text ?? "text-gray-300";
          const label = style?.label ?? mood.name;

          return (
            <button
              key={mood.id}
              type="button"
              onClick={() => onToggle(mood.id)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors select-none ${
                isSelected
                  ? `${bg} ${text} border-current/50 shadow-xs shadow-black/20`
                  : "border-gray-800 bg-gray-900/80 text-gray-400 hover:border-gray-700 hover:text-gray-200"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
