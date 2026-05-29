"use client";

import {
  Platform,
  PLATFORM_LABELS,
} from "@/src/lib/backend/backlog/domain/models";
import { MoodDto } from "@/src/lib/backend/backlog/domain/models";
import { MoodFilter } from "./MoodFilter";
import { SortOption } from "../hooks/useGameFilters";

const PLATFORM_FILTER_OPTIONS: { value: Platform; label: string }[] = [
  { value: "pc", label: PLATFORM_LABELS.pc },
  { value: "xbox", label: PLATFORM_LABELS.xbox },
  { value: "playstation", label: PLATFORM_LABELS.playstation },
  { value: "switch", label: PLATFORM_LABELS.switch },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "priority-desc", label: "Priority: High → Low" },
  { value: "priority-asc", label: "Priority: Low → High" },
  { value: "name-asc", label: "Name: A → Z" },
  { value: "name-desc", label: "Name: Z → A" },
];

interface GameFiltersPanelProps {
  moods: MoodDto[];
  moodFilter: string | null;
  onMoodChange: (v: string | null) => void;
  sortBy: SortOption;
  onSortChange: (v: SortOption) => void;
  platformFilter: Platform | null;
  onPlatformChange: (v: Platform | null) => void;
  className?: string;
  children?: React.ReactNode;
}

export function GameFiltersPanel({
  moods,
  moodFilter,
  onMoodChange,
  sortBy,
  onSortChange,
  platformFilter,
  onPlatformChange,
  className,
  children,
}: GameFiltersPanelProps) {
  return (
    <div
      className={`space-y-4 rounded-xl border border-gray-800 bg-gray-900/60 p-4 ${className ?? ""}`}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium tracking-wide text-gray-400 uppercase">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="focus:border-brand-600 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium tracking-wide text-gray-400 uppercase">
            Platform
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onPlatformChange(null)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                platformFilter === null
                  ? "bg-brand-700 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              All
            </button>
            {PLATFORM_FILTER_OPTIONS.map((p) => (
              <button
                key={p.value}
                onClick={() =>
                  onPlatformChange(platformFilter === p.value ? null : p.value)
                }
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  platformFilter === p.value
                    ? "bg-brand-700 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium tracking-wide text-gray-400 uppercase">
          Mood
        </label>
        <MoodFilter moods={moods} value={moodFilter} onChange={onMoodChange} />
      </div>

      {children && <div>{children}</div>}
    </div>
  );
}
