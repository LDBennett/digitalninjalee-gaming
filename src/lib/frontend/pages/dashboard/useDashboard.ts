"use client";

import { useState, useMemo } from "react";
import { useAuthStore } from "@/src/lib/frontend/shared/store/auth.store";
import {
  useMoods,
  useGameActions,
  useGameQuery,
  useRecentActivity,
} from "@/src/lib/frontend/features";
import {
  deriveStats,
  getTopPriority,
  getPlayingGames,
  getTopWishlist,
  getLastCompleted,
} from "@/src/lib/backend/backlog/domain/services";

export function useDashboard() {
  const { authLoading } = useAuthStore();
  const { moods } = useMoods();

  const [showAdd, setShowAdd] = useState(false);

  const { games: allGames, invalidate } = useGameQuery();
  const stats = useMemo(() => deriveStats(allGames), [allGames]);

  const { handleAdd } = useGameActions({ onAddSuccess: invalidate });

  const { recentPlays } = useRecentActivity();

  const topPriority = useMemo(() => getTopPriority(allGames), [allGames]);
  const playingGames = useMemo(() => getPlayingGames(allGames), [allGames]);
  const topWishlist = useMemo(() => getTopWishlist(allGames), [allGames]);
  const lastCompleted = useMemo(() => getLastCompleted(allGames), [allGames]);

  return {
    stats,
    topPriority,
    recentPlays,
    playingGames,
    topWishlist,
    lastCompleted,
    moods,
    showAdd,
    setShowAdd,
    loading: authLoading,
    handleAdd,
  };
}
