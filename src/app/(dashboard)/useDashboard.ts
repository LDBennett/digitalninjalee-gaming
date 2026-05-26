"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/src/domains/shared/auth/auth.store";
import { useMoods } from "@/src/domains/games/hooks/useMoods";
import { useGameActions } from "@/src/domains/games/hooks/useGameActions";
import { useGameQuery } from "@/src/domains/games/hooks/useGameQuery";
import { useStats } from "@/src/domains/games/hooks/useStats";
import {
  getTopPriority,
  getPlayingGames,
} from "@/src/domains/games/services/game.queries";
import { gameKeys } from "@/src/domains/games/queryKeys";

export function useDashboard() {
  const { session, authLoading } = useAuthStore();
  const { moods, moodsLoading } = useMoods();
  const isAuthenticated = session !== null;
  const queryClient = useQueryClient();

  const [showAdd, setShowAdd] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const { games: allGames, gamesLoading } = useGameQuery();
  const { stats, statsLoading, invalidateStats } = useStats();

  const loading = authLoading || gamesLoading || statsLoading || moodsLoading;

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: gameKeys.all });
    invalidateStats();
  };

  const { handleAdd, handleStatusChange } = useGameActions({
    onAddSuccess: invalidateAll,
    onStatusSuccess: invalidateAll,
  });

  const topPriority = getTopPriority(allGames);
  const playingGames = getPlayingGames(allGames);

  return {
    stats,
    topPriority,
    playingGames,
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
