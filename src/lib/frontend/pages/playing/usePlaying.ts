"use client";

import { useState, useEffect, useMemo } from "react";
import { GameDto } from "@/src/lib/backend/backlog/domain/models";
import { useAuthStore } from "@/src/lib/frontend/shared/store/auth.store";
import {
  useMoods,
  useGameActions,
  useGameQuery,
  useGameFilters,
  useRecentActivity,
} from "@/src/lib/frontend/features";
import { useClientPagination } from "@/src/lib/frontend/shared/hooks/useClientPagination";

const RECENT_ACTIVITY_LIMIT = 30;

export type PlayingTab =
  | "playing"
  | "ongoing"
  | "replaying"
  | "recently-played";

export function usePlaying() {
  const { session, authLoading } = useAuthStore();
  const { moods } = useMoods();
  const isAuthenticated = session !== null;

  const [activeTab, setActiveTabState] = useState<PlayingTab>("playing");
  const [editGame, setEditGame] = useState<GameDto | null>(null);

  const { games: allGames, invalidate } = useGameQuery();
  const playingGames = useMemo(
    () => allGames.filter((g) => g.status === "playing"),
    [allGames],
  );
  const ongoingGames = useMemo(
    () => allGames.filter((g) => g.status === "ongoing"),
    [allGames],
  );
  const replayingGames = useMemo(
    () => allGames.filter((g) => g.replay_status === "replaying"),
    [allGames],
  );

  const games =
    activeTab === "playing"
      ? playingGames
      : activeTab === "ongoing"
        ? ongoingGames
        : replayingGames;

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

  const { recentPlays, recentLoading } = useRecentActivity(
    RECENT_ACTIVITY_LIMIT,
  );
  const {
    page: recentPage,
    setPage: setRecentPage,
    totalPages: recentTotalPages,
    paginated: recentPaginated,
  } = useClientPagination(recentPlays);

  const setActiveTab = (tab: PlayingTab) => {
    setActiveTabState(tab);
    setPage(1);
    setRecentPage(1);
    setMoodFilter(null);
    setPlayGoalFilter(null);
    setSearchQuery("");
  };

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

  const { handleEdit, handleDelete } = useGameActions({
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
    activeTab,
    setActiveTab,
    games,
    allGames,
    filtered,
    paginated,
    page,
    setPage,
    totalPages,
    recentPlays,
    recentPaginated,
    recentPage,
    setRecentPage,
    recentTotalPages,
    recentLoading,
    moods,
    moodFilter,
    setMoodFilter,
    searchQuery,
    setSearchQuery,
    editGame,
    setEditGame,
    loading: authLoading,
    isAuthenticated,
    sortBy,
    setSortBy,
    platformFilter,
    setPlatformFilter,
    playGoalFilter,
    setPlayGoalFilter,
    handleEdit: handleEditSubmit,
    handleDelete: handleDeleteConfirm,
  };
}
