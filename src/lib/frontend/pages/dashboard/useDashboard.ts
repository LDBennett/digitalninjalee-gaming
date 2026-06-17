"use client";

import { useState, useMemo } from "react";
import { WISHLIST_STATUSES } from "@/src/lib/backend/backlog/domain/models";
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

  const { games: allGames, invalidate } = useGameQuery();
  const stats = useMemo(() => deriveStats(allGames), [allGames]);

  const { handleAdd, handleStatusChange } = useGameActions({
    onAddSuccess: invalidate,
    onStatusSuccess: invalidate,
  });

  const topPriority = getTopPriority(allGames);
  const playingGames = getPlayingGames(allGames);
  const topWishlist = useMemo(
    () =>
      allGames
        .filter((g) => (WISHLIST_STATUSES as ReadonlyArray<string>).includes(g.status))
        .sort((a, b) => b.priority_score - a.priority_score)
        .slice(0, 5),
    [allGames],
  );

  const lastCompleted = useMemo(
    () =>
      allGames
        .filter((g) => g.status === "completed" || g.status === "main-complete")
        .sort((a, b) => {
          const aDate = a.last_played_at ?? a.created_at;
          const bDate = b.last_played_at ?? b.created_at;
          return bDate.localeCompare(aDate);
        })
        .slice(0, 5),
    [allGames],
  );

  return {
    stats,
    topPriority,
    playingGames,
    topWishlist,
    lastCompleted,
    moods,
    showAdd,
    setShowAdd,
    loading: authLoading,
    isAuthenticated,
    handleAdd,
    handleStatusChange,
  };
}
