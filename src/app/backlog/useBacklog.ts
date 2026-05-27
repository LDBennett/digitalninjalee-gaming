"use client";

import { useState, useEffect, useMemo } from "react";
import { GameDto } from "@/src/domains/games/models/game.types";
import { useAuthStore } from "@/src/domains/shared/auth/auth.store";
import { useMoods } from "@/src/domains/games/hooks/useMoods";
import { useGameActions } from "@/src/domains/games/hooks/useGameActions";
import { useGameQuery } from "@/src/domains/games/hooks/useGameQuery";
import { useGameFilters } from "@/src/domains/games/hooks/useGameFilters";
import { useGamePriority } from "@/src/domains/games/hooks/useGamePriority";
import { useClientPagination } from "@/src/domains/shared/hooks/useClientPagination";

export function useBacklog() {
  const { session, authLoading } = useAuthStore();
  const { moods } = useMoods();
  const isAuthenticated = session !== null;

  const [showPicker, setShowPicker] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editGame, setEditGame] = useState<GameDto | null>(null);

  const [replayOnly, setReplayOnly] = useState(false);

  const { games: allGames, invalidate, queryKey } = useGameQuery();
  const statusGames = useMemo(() => allGames.filter((g) => g.status === "backlog"), [allGames]);
  const wantToReplayCount = useMemo(
    () => allGames.filter((g) => g.replay_status === "want-to-replay").length,
    [allGames],
  );
  const games = useMemo(
    () => replayOnly ? allGames.filter((g) => g.replay_status === 'want-to-replay') : statusGames,
    [allGames, statusGames, replayOnly],
  );
  const { searchQuery, setSearchQuery, moodFilter, setMoodFilter,
          sortBy, setSortBy, platformFilter, setPlatformFilter, filtered } =
    useGameFilters(games);
  const { page, setPage, totalPages, paginated } =
    useClientPagination(filtered);
  const { handlePriorityChange } = useGamePriority(queryKey);

  useEffect(() => { setPage(1); }, [moodFilter, setPage]);
  useEffect(() => { setPage(1); }, [searchQuery, setPage]);
  useEffect(() => { setPage(1); }, [sortBy, setPage]);
  useEffect(() => { setPage(1); }, [platformFilter, setPage]);

  const { handleAdd, handleStatusChange, handleEdit, handleDelete } =
    useGameActions({
      onAddSuccess: invalidate,
      onStatusSuccess: invalidate,
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
    showPicker,
    setShowPicker,
    editGame,
    setEditGame,
    loading: authLoading,
    isAuthenticated,
    handleAdd,
    handleEdit: handleEditSubmit,
    handleDelete: handleDeleteConfirm,
    handleStatusChange,
    sortBy, setSortBy,
    platformFilter, setPlatformFilter,
    wantToReplayCount,
    handlePriorityChange: (id: string, delta: number) =>
      handlePriorityChange(id, delta, games),
  };
}
