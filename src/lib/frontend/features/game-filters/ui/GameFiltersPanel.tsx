"use client";

import {
  PlayGoal,
  PLAY_GOALS,
  PLAY_GOAL_LABELS,
  MoodDto,
} from "@/src/lib/backend/backlog/domain/models";
import { type DurationFilter } from "@/src/lib/backend/backlog/domain/services";
import { Select } from "@/src/lib/frontend/shared";
import { MoodFilter } from "./MoodFilter";
import { useGameFilters } from "../hooks/useGameFilters";
import { GameFiltersPanelDurationSelect } from "./GameFiltersPanel.DurationSelect";
import { GameFiltersPanelPlatformButtons } from "./GameFiltersPanel.PlatformButtons";

type SortOption = ReturnType<typeof useGameFilters>["sortBy"];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "priority-desc", label: "Priority: High → Low" },
  { value: "priority-asc", label: "Priority: Low → High" },
  { value: "name-asc", label: "Name: A → Z" },
  { value: "name-desc", label: "Name: Z → A" },
];

interface GameFiltersPanelProps {
  filters: Pick<
    ReturnType<typeof useGameFilters>,
    | "moodFilter"
    | "setMoodFilter"
    | "sortBy"
    | "setSortBy"
    | "platformFilter"
    | "setPlatformFilter"
  > & {
    playGoalFilter?: PlayGoal | null;
    setPlayGoalFilter?: (val: PlayGoal | null) => void;
    durationFilter?: DurationFilter | null;
    setDurationFilter?: (val: DurationFilter | null) => void;
  };
  moods: MoodDto[];
  className?: string;
  children?: React.ReactNode;
}

export function GameFiltersPanel({
  filters,
  moods,
  className,
  children,
}: GameFiltersPanelProps) {
  const {
    moodFilter,
    setMoodFilter,
    sortBy,
    setSortBy,
    platformFilter,
    setPlatformFilter,
    playGoalFilter,
    setPlayGoalFilter,
    durationFilter,
    setDurationFilter,
  } = filters;

  const showPlayGoal =
    playGoalFilter !== undefined && setPlayGoalFilter !== undefined;
  const showDuration =
    durationFilter !== undefined && setDurationFilter !== undefined;

  return (
    <div
      className={`space-y-4 rounded-xl border border-gray-800 bg-gray-900/60 p-4 ${className ?? ""}`}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium tracking-wide text-gray-400 uppercase">
            Sort By
          </label>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            fullWidth
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>

        <GameFiltersPanelPlatformButtons
          platformFilter={platformFilter}
          onSelectPlatform={setPlatformFilter}
        />

        {showPlayGoal && (
          <div>
            <label className="mb-1.5 block text-xs font-medium tracking-wide text-gray-400 uppercase">
              Play Goal
            </label>
            <Select
              value={playGoalFilter ?? ""}
              onChange={(e) =>
                setPlayGoalFilter((e.target.value as PlayGoal) || null)
              }
              fullWidth
            >
              <option value="">All Play Goals</option>
              {PLAY_GOALS.map((g) => (
                <option key={g} value={g}>
                  {PLAY_GOAL_LABELS[g]}
                </option>
              ))}
            </Select>
          </div>
        )}

        {showDuration && (
          <GameFiltersPanelDurationSelect
            value={durationFilter}
            onChange={setDurationFilter}
          />
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium tracking-wide text-gray-400 uppercase">
          Mood
        </label>
        <MoodFilter moods={moods} value={moodFilter} onChange={setMoodFilter} />
      </div>

      {children && <div>{children}</div>}
    </div>
  );
}
