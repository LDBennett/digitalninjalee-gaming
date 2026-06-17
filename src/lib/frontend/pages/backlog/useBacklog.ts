"use client";

import { useState, useEffect, useMemo } from "react";
import { GameDto } from "@/src/lib/backend/backlog/domain/models";
import { useAuthStore } from "@/src/lib/frontend/shared/store/auth.store";
import {
  useMoods,
  useGameActions,
  useGameQuery,
  useGameFilters,
  useGamePriority,
} from "@/src/lib/frontend/features";
import { useClientPagination } from "@/src/lib/frontend/shared/hooks/useClientPagination";

export function useBacklog() {
  const { session, authLoading } = useAuthStore();
  const { moods } = useMoods();
  const isAuthenticated = session !== null;

  const [showAdd, setShowAdd] = useState(false);
  const [editGame, setEditGame] = useState<GameDto | null>(null);
  const [replayOnly, setReplayOnly] = useState(false);

  const { games: allGames, invalidate, queryKey } = useGameQuery();
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

  const { handleAdd, handleEdit, handleDelete } =
    useGameActions({
      onAddSuccess: invalidate,
      onEditSuccess: () => {
        setEditGame(null);
        invalidate();
      },
      onDeleteSuccess: invalidate,
    });

  const handleDeleteConfirm = (id: string) => {
    if (!confirm("Remove this game from your backlog?")) return;
    handleDelete(id);
  };

  const handleEditSubmit = (data: object) => {
    if (!editGame) return;
    handleEdit(editGame.id, data);
  };

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
    loading: authLoading,
    isAuthenticated,
    handleAdd,
    handleEdit: handleEditSubmit,
    handleDelete: handleDeleteConfirm,
    sortBy,
    setSortBy,
    platformFilter,
    setPlatformFilter,
    wantToReplayCount,
    handlePriorityChange: (id: string, delta: number) =>
      handlePriorityChange(id, delta, games),
  };
}
