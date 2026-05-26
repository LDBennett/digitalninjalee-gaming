"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { statsKeys } from "@/src/domains/games/queryKeys";

export interface GameStats {
  backlog: number;
  playing: number;
  ongoing: number;
  completed: number;
  completedFull: number;
  wishlist: number;
  total: number;
}

export function useStats() {
  const queryClient = useQueryClient();

  const { data: statusCounts = {}, isPending: statsLoading } = useQuery<
    Record<string, number>
  >({
    queryKey: statsKeys.statusCounts,
    queryFn: () => fetch("/api/games/stats").then((r) => r.json()),
  });

  const stats: GameStats = {
    backlog: statusCounts["backlog"] ?? 0,
    playing: statusCounts["playing"] ?? 0,
    ongoing: statusCounts["ongoing"] ?? 0,
    completed:
      (statusCounts["completed"] ?? 0) + (statusCounts["main-complete"] ?? 0),
    completedFull: statusCounts["completed"] ?? 0,
    wishlist:
      (statusCounts["interested"] ?? 0) +
      (statusCounts["pre-ordered"] ?? 0) +
      (statusCounts["keep-an-eye-on"] ?? 0),
    total: Object.values(statusCounts).reduce((sum, n) => sum + n, 0),
  };

  const invalidateStats = () =>
    queryClient.invalidateQueries({ queryKey: statsKeys.statusCounts });

  return { stats, statsLoading, invalidateStats };
}
