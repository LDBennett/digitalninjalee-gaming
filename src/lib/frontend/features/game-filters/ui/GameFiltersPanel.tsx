"use client";

import { Platform, PLATFORM_LABELS } from "@/src/lib/backend/backlog/domain/models";
import { MoodDto } from "@/src/lib/backend/backlog/domain/models";
import { MoodFilter } from "./MoodFilter";
import { SortOption } from "../hooks/useGameFilters";

const PLATFORM_FILTER_OPTIONS: { value: Platform; label: string }[] = [
  { value: "pc",          label: PLATFORM_LABELS.pc          },
  { value: "xbox",        label: PLATFORM_LABELS.xbox        },
  { value: "playstation", label: PLATFORM_LABELS.playstation },
  { value: "switch",      label: PLATFORM_LABELS.switch      },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "priority-desc", label: "Priority: High → Low" },
  { value: "priority-asc",  label: "Priority: Low → High" },
  { value: "name-asc",      label: "Name: A → Z" },
  { value: "name-desc",     label: "Name: Z → A" },
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
    <div className={`bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-4 ${className ?? ""}`}>
      <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
        <div>
          <label className="block mb-1.5 font-medium text-gray-400 text-xs uppercase tracking-wide">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-gray-800 px-3 py-2 border border-gray-700 focus:border-brand-600 rounded-lg focus:outline-none w-full text-white text-sm"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1.5 font-medium text-gray-400 text-xs uppercase tracking-wide">Platform</label>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onPlatformChange(null)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                platformFilter === null ? "bg-brand-700 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              All
            </button>
            {PLATFORM_FILTER_OPTIONS.map((p) => (
              <button
                key={p.value}
                onClick={() => onPlatformChange(platformFilter === p.value ? null : p.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  platformFilter === p.value ? "bg-brand-700 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block mb-1.5 font-medium text-gray-400 text-xs uppercase tracking-wide">Mood</label>
        <MoodFilter moods={moods} value={moodFilter} onChange={onMoodChange} />
      </div>

      {children && <div>{children}</div>}
    </div>
  );
}
