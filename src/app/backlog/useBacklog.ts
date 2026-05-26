"use client";

import { useState, useEffect } from "react";
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
  const { moods, moodsLoading } = useMoods();
  const isAuthenticated = session !== null;

  const [showPicker, setShowPicker] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editGame, setEditGame] = useState<GameDto | null>(null);

  const { games, gamesLoading, invalidate, queryKey } = useGameQuery("backlog");
  const { searchQuery, setSearchQuery, moodFilter, setMoodFilter, filtered } =
    useGameFilters(games);
  const { page, setPage, totalPages, paginated } =
    useClientPagination(filtered);
  const { handlePriorityChange } = useGamePriority(queryKey);

  const loading = authLoading || gamesLoading || moodsLoading;

  useEffect(() => {
    setPage(1);
  }, [moodFilter, setPage]);
  useEffect(() => {
    setPage(1);
  }, [searchQuery, setPage]);

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
    loading,
    isAuthenticated,
    handleAdd,
    handleEdit: handleEditSubmit,
    handleDelete: handleDeleteConfirm,
    handleStatusChange,
    handlePriorityChange: (id: string, delta: number) =>
      handlePriorityChange(id, delta, games),
  };
}
