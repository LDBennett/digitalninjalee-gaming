"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GameDto } from "@/src/domains/games/models/game.types";
import { useAuthStore } from "@/src/domains/shared/auth/auth.store";
import { useMoods } from "@/src/domains/games/hooks/useMoods";
import { useGameActions } from "@/src/domains/games/hooks/useGameActions";
import { getTopPriority, getRecentlyPlayed } from "@/src/domains/games/services/game.queries";
import { gameKeys, statsKeys } from "@/src/domains/games/queryKeys";
interface Stats {
  backlog: number;
  playing: number;
  completed: number;
  ongoing: number;
  wishlist: number;
  total: number;
}

export function useDashboard() {
  const { session, authLoading } = useAuthStore();
  const { moods, moodsLoading } = useMoods();
  const isAuthenticated = session !== null;
  const queryClient = useQueryClient();

  const [showAdd, setShowAdd] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const { data: allGames = [], isPending: gamesLoading } = useQuery<GameDto[]>({
    queryKey: gameKeys.all,
    queryFn: () => fetch("/api/games").then((r) => r.json()),
  });

  const { data: statusCounts = {}, isPending: statsLoading } = useQuery<
    Record<string, number>
  >({
    queryKey: statsKeys.statusCounts,
    queryFn: () => fetch("/api/games/stats").then((r) => r.json()),
  });

  const loading = authLoading || gamesLoading || statsLoading || moodsLoading;

  const stats: Stats = {
    backlog: statusCounts["backlog"] ?? 0,
    playing: statusCounts["playing"] ?? 0,
    completed:
      (statusCounts["completed"] ?? 0) + (statusCounts["main-complete"] ?? 0),
    ongoing: statusCounts["ongoing"] ?? 0,
    wishlist:
      (statusCounts["interested"] ?? 0) +
      (statusCounts["pre-ordered"] ?? 0) +
      (statusCounts["keep-an-eye-on"] ?? 0),
    total: Object.values(statusCounts).reduce((sum, n) => sum + n, 0),
  };

  const invalidateGames = () => {
    queryClient.invalidateQueries({ queryKey: gameKeys.all });
    queryClient.invalidateQueries({ queryKey: statsKeys.statusCounts });
  };

  const { handleAdd, handleStatusChange } = useGameActions({
    onAddSuccess: invalidateGames,
    onStatusSuccess: invalidateGames,
  });

  const topPriority = getTopPriority(allGames);
  const recentlyPlayed = getRecentlyPlayed(allGames);

  return {
    stats,
    topPriority,
    recentlyPlayed,
    moods,
    showAdd,
    setShowAdd,
    showPicker,
    setShowPicker,
    loading,
    isAuthenticated,
    handleAdd,
    handleStatusChange,
  };
}
