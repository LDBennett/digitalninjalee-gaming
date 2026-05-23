"use client";

import { MoodDto } from "@/src/domains/backlog/models/mood.types";
import { MoodBadge, getMoodLabel } from "./MoodBadge";

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
        <select
          id="mood-filter"
          name="mood-filter"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          className="bg-gray-900 px-3 py-2 border border-gray-800 focus:border-brand-600 rounded-lg focus:outline-none w-full text-white text-sm"
        >
          <option value="">All moods</option>
          {moods.map((mood) => (
            <option key={mood.id} value={mood.name}>
              {getMoodLabel(mood.name)}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: pills */}
      <div className="hidden sm:flex flex-wrap items-center gap-2">
        <button
          onClick={() => onChange(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            !value
              ? "bg-gray-700 text-white"
              : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
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
                ? "scale-110 ring-2 ring-white/20 rounded"
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
