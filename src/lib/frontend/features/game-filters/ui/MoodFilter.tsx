"use client";

import { MoodDto } from "@/src/lib/backend/backlog/domain/models";
import { MoodBadge, getMoodLabel } from "@/src/lib/frontend/entities/mood";
import { Select } from "@/src/lib/frontend/shared";

interface MoodFilterProps {
  moods: MoodDto[];
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
}

export function MoodFilter({
  moods,
  value,
  onChange,
  className = "",
}: MoodFilterProps) {
  return (
    <div className={className}>
      {/* Mobile: dropdown */}
      <div className="sm:hidden">
        <Select
          id="mood-filter"
          name="mood-filter"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          fullWidth
          className="border-gray-800 bg-gray-900"
        >
          <option value="">All moods</option>
          {moods.map((mood) => (
            <option key={mood.id} value={mood.name}>
              {getMoodLabel(mood.name)}
            </option>
          ))}
        </Select>
      </div>

      {/* Desktop: pills */}
      <div className="hidden flex-wrap items-center gap-2 sm:flex">
        <button
          onClick={() => onChange(null)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            !value
              ? "bg-gray-700 text-white"
              : "text-gray-500 hover:bg-gray-800 hover:text-gray-300"
          }`}
        >
          All
        </button>
        {moods.map((mood) => (
          <button
            key={mood.id}
            onClick={() => onChange(value === mood.name ? null : mood.name)}
            className={`transition-all duration-150 ${
              value === mood.name
                ? "scale-110 rounded ring-2 ring-white/20"
                : "opacity-50 hover:opacity-80"
            }`}
          >
            <MoodBadge mood={mood.name} />
          </button>
        ))}
      </div>
    </div>
  );
}
