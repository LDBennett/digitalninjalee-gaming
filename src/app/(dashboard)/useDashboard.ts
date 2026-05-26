"use client";

import { useState, useMemo } from "react";
import { useAuthStore } from "@/src/domains/shared/auth/auth.store";
import { useMoods } from "@/src/domains/games/hooks/useMoods";
import { useGameActions } from "@/src/domains/games/hooks/useGameActions";
import { useGameQuery } from "@/src/domains/games/hooks/useGameQuery";
import {
  getTopPriority,
  getPlayingGames,
  deriveStats,
} from "@/src/domains/games/services/game.queries";

export function useDashboard() {
  const { session, authLoading } = useAuthStore();
  const { moods } = useMoods();
  const isAuthenticated = session !== null;

  const [showAdd, setShowAdd] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const { games: allGames, invalidate } = useGameQuery();

  const stats = useMemo(() => deriveStats(allGames), [allGames]);

  const { handleAdd, handleStatusChange } = useGameActions({
    onAddSuccess: invalidate,
    onStatusSuccess: invalidate,
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
    loading: authLoading,
    isAuthenticated,
    handleAdd,
    handleStatusChange,
  };
}
