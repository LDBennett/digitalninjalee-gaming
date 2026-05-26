"use client";

import { useState, useEffect } from "react";
import { GameDto } from "@/src/domains/games/models/game.types";
import { useAuthStore } from "@/src/domains/shared/auth/auth.store";
import { useMoods } from "@/src/domains/games/hooks/useMoods";
import { useGameActions } from "@/src/domains/games/hooks/useGameActions";
import { useGameQuery } from "@/src/domains/games/hooks/useGameQuery";
import { useGameFilters } from "@/src/domains/games/hooks/useGameFilters";
import { useClientPagination } from "@/src/domains/shared/hooks/useClientPagination";

export type LibraryTab =
  | "all"
  | "completed"
  | "main-complete"
  | "ongoing"
  | "dropped";

export const LIBRARY_TAB_STATUSES: Record<
  Exclude<LibraryTab, "all">,
  string
> = {
  completed: "completed",
  "main-complete": "main-complete",
  ongoing: "ongoing",
  dropped: "dropped",
};

export const LIBRARY_TAB_LABELS: Record<LibraryTab, string> = {
  all: "All",
  completed: "Completed (100%)",
  "main-complete": "Completed",
  ongoing: "Ongoing",
  dropped: "Dropped",
};

export function useLibrary() {
  const { session } = useAuthStore();
  const { moods } = useMoods();
  const isAuthenticated = session !== null;

  const [tab, setTab] = useState<LibraryTab>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editGame, setEditGame] = useState<GameDto | null>(null);

  const statusParam = tab !== "all" ? LIBRARY_TAB_STATUSES[tab] : undefined;

  const { games, gamesLoading, invalidate } = useGameQuery(statusParam);
  const { searchQuery, setSearchQuery, moodFilter, setMoodFilter, filtered } =
    useGameFilters(games);
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
