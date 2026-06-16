"use client";

import { useState, useMemo } from "react";
import { useAuthStore } from "@/src/lib/frontend/shared/store/auth.store";
import {
  useMoods,
  useGameActions,
  useGameQuery,
} from "@/src/lib/frontend/features";
import {
  getTopPriority,
  getPlayingGames,
  deriveStats,
} from "@/src/lib/backend/backlog/domain/services";

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
