"use client";

import { useState, useEffect, useMemo } from "react";
import {
  useMoods,
  useGameEditActions,
  useGameQuery,
  useGameFilters,
  useGamePriority,
} from "@/src/lib/frontend/features";
import { useAuthStore, useClientPagination } from "@/src/lib/frontend/shared";

export function useBacklog() {
  const { session, authLoading } = useAuthStore();
  const { moods } = useMoods();
  const isAuthenticated = session !== null;

  const [showAdd, setShowAdd] = useState(false);
  const [replayOnly, setReplayOnly] = useState(false);

  const {
    games: allGames,
    gamesLoading,
    invalidate,
    queryKey,
  } = useGameQuery();
  const wantToReplayCount = useMemo(
    () => allGames.filter((g) => g.replay_status === "want-to-replay").length,
    [allGames],
  );
  const games = useMemo(() => {
    const base = allGames.filter(
      (g) => g.status === "backlog" || g.replay_status === "want-to-replay",
    );
    return replayOnly
      ? base.filter((g) => g.replay_status === "want-to-replay")
      : base;
  }, [allGames, replayOnly]);

  const {
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
    filtered,
  } = useGameFilters(games);
  const { page, setPage, totalPages, paginated } =
    useClientPagination(filtered);
  const { handlePriorityChange } = useGamePriority(queryKey);

  useEffect(() => {
    setPage(1);
  }, [moodFilter, setPage]);
  useEffect(() => {
    setPage(1);
  }, [searchQuery, setPage]);
  useEffect(() => {
    setPage(1);
  }, [sortBy, setPage]);
  useEffect(() => {
    setPage(1);
  }, [platformFilter, setPage]);
  useEffect(() => {
    setPage(1);
  }, [playGoalFilter, setPage]);

  const { editGame, setEditGame, handleAdd, handleEdit, handleDelete } =
    useGameEditActions({
      invalidate,
      deleteConfirmMessage: "Remove this game from your backlog?",
    });

  return {
    games,
    filtered,
    replayOnly,
    setReplayOnly,
    paginated,
    page,
    setPage,
    totalPages,
    moods,
    moodFilter,
    setMoodFilter,
    searchQuery,
    setSearchQuery,
    showAdd,
    setShowAdd,
    editGame,
    setEditGame,
    loading: authLoading || gamesLoading,
    isAuthenticated,
    handleAdd,
    handleEdit,
    handleDelete,
    sortBy,
    setSortBy,
    platformFilter,
    setPlatformFilter,
    playGoalFilter,
    setPlayGoalFilter,
    wantToReplayCount,
    handlePriorityChange: (id: string, delta: number) =>
      handlePriorityChange(id, delta, games),
  };
}
