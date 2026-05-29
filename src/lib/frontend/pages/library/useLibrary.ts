"use client";

import { useState, useEffect } from "react";
import { GameDto } from "@/src/lib/backend/backlog/domain/models";
import {
  LibraryTab,
  LIBRARY_TAB_STATUSES,
  LIBRARY_TAB_LABELS,
} from "@/src/lib/backend/backlog/domain/models";
import { useAuthStore } from "@/src/lib/frontend/shared/auth/auth.store";
import {
  useMoods,
  useGameActions,
  useGameQuery,
  useGameFilters,
} from "@/src/lib/frontend/features";
import { useClientPagination } from "@/src/lib/frontend/shared/hooks/useClientPagination";

export type { LibraryTab };
export { LIBRARY_TAB_STATUSES, LIBRARY_TAB_LABELS };

export function useLibrary() {
  const { session } = useAuthStore();
  const { moods } = useMoods();
  const isAuthenticated = session !== null;

  const [tab, setTab] = useState<LibraryTab>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editGame, setEditGame] = useState<GameDto | null>(null);

  const statusParam = tab !== "all" ? LIBRARY_TAB_STATUSES[tab] : undefined;
  const { games, gamesLoading, invalidate } = useGameQuery(statusParam);
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

  useEffect(() => {
    setPage(1);
  }, [tab, setPage]);
  useEffect(() => {
    setPage(1);
  }, [searchQuery, setPage]);
  useEffect(() => {
    setPage(1);
  }, [moodFilter, setPage]);
  useEffect(() => {
    setPage(1);
  }, [sortBy, setPage]);
  useEffect(() => {
    setPage(1);
  }, [platformFilter, setPage]);

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
    if (!confirm("Delete this game?")) return;
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
    tab,
    setTab,
    searchQuery,
    setSearchQuery,
    moodFilter,
    setMoodFilter,
    sortBy,
    setSortBy,
    platformFilter,
    setPlatformFilter,
    editGame,
    setEditGame,
    gamesLoading,
    isAuthenticated,
    handleStatusChange,
    handleEdit: handleEditSubmit,
    handleDelete: handleDeleteConfirm,
    handleAdd,
    showAdd,
    setShowAdd,
  };
}
