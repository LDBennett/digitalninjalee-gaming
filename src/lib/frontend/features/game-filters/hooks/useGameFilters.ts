"use client";

import { useState, useMemo } from "react";
import {
  GameDto,
  Platform,
  PlayGoal,
} from "@/src/lib/backend/backlog/domain/models";
import {
  filterByMood,
  filterByPlayGoal,
  filterByTitle,
  filterByDuration,
  type DurationFilter,
} from "@/src/lib/backend/backlog/domain/services";

export type SortOption =
  | "priority-desc"
  | "priority-asc"
  | "name-asc"
  | "name-desc";

export function useGameFilters(games: GameDto[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [moodFilter, setMoodFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("priority-desc");
  const [platformFilter, setPlatformFilter] = useState<Platform | null>(null);
  const [playGoalFilter, setPlayGoalFilter] = useState<PlayGoal | null>(null);
  const [durationFilter, setDurationFilter] =
    useState<DurationFilter | null>(null);

  const filtered = useMemo(() => {
    let result = filterByMood(games, moodFilter);
    result = filterByPlayGoal(result, playGoalFilter);
    result = filterByTitle(result, searchQuery);
    result = filterByDuration(result, durationFilter);
    if (platformFilter)
      result = result.filter((g) => g.platform === platformFilter);
    return [...result].sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.title.localeCompare(b.title);
        case "name-desc":
          return b.title.localeCompare(a.title);
        case "priority-asc":
          return a.priority_score - b.priority_score;
        case "priority-desc":
          return b.priority_score - a.priority_score;
      }
    });
  }, [
    games,
    moodFilter,
    playGoalFilter,
    searchQuery,
    platformFilter,
    durationFilter,
    sortBy,
  ]);

  return {
    searchQuery,
    setSearchQuery,
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
    filtered,
  };
}
