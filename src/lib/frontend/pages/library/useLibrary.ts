"use client";

import { useState, useEffect, useMemo } from "react";
import {
  LibraryTab,
  LIBRARY_TAB_STATUSES,
  LIBRARY_TAB_LABELS,
} from "@/src/lib/backend/backlog/domain/models";
import {
  useMoods,
  useGameEditActions,
  useGameFilters,
} from "@/src/lib/frontend/features";
import { useGameQuery } from "@/src/lib/frontend/entities/game";
import { useAuthStore, useClientPagination } from "@/src/lib/frontend/shared";

export type { LibraryTab };
export { LIBRARY_TAB_STATUSES, LIBRARY_TAB_LABELS };

export function useLibrary() {
  const { session, authLoading } = useAuthStore();
  const { moods } = useMoods();
  const isAuthenticated = session !== null;

  const [tab, setTab] = useState<LibraryTab>("all");
  const [showAdd, setShowAdd] = useState(false);

  const statusParam = tab !== "all" ? LIBRARY_TAB_STATUSES[tab] : undefined;
  const { games: allGames, gamesLoading, invalidate } = useGameQuery();
  const games = useMemo(
    () =>
      statusParam ? allGames.filter((g) => g.status === statusParam) : allGames,
    [allGames, statusParam],
  );
  const {
    searchQuery,
    setSearchQuery,
    moodFilter,
    setMoodFilter,
    sortBy,
    setSortBy,
    platformFilter,
    setPlatformFilter,
    durationFilter,
    setDurationFilter,
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
  useEffect(() => {
    setPage(1);
  }, [durationFilter, setPage]);

  const { editGame, setEditGame, handleAdd, handleEdit, handleDelete } =
    useGameEditActions({ invalidate });

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
    durationFilter,
    setDurationFilter,
    editGame,
    setEditGame,
    gamesLoading: authLoading || gamesLoading,
    isAuthenticated,
    handleEdit,
    handleDelete,
    handleAdd,
    showAdd,
    setShowAdd,
  };
}
