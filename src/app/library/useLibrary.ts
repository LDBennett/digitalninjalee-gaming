"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GameDto } from "@/src/domains/games/models/game.types";
import { useAuthStore } from "@/src/domains/shared/auth/auth.store";
import { useMoods } from "@/src/domains/games/hooks/useMoods";
import { useGameActions } from "@/src/domains/games/hooks/useGameActions";
import { filterByTitle, filterByMood } from "@/src/domains/games/services/game.queries";
import { gameKeys } from "@/src/domains/games/queryKeys";

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
  const queryClient = useQueryClient();

  const PAGE_SIZE = 20;

  const [tab, setTab] = useState<LibraryTab>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [moodFilter, setMoodFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [editGame, setEditGame] = useState<GameDto | null>(null);

  const statusParam = tab !== "all" ? LIBRARY_TAB_STATUSES[tab] : undefined;
  const queryKey = statusParam ? gameKeys.byStatus(statusParam) : gameKeys.all;

  const { data: games = [], isPending: gamesLoading } = useQuery<GameDto[]>({
    queryKey,
    queryFn: () =>
      statusParam
        ? fetch(`/api/games?status=${statusParam}`).then((r) => r.json())
        : fetch("/api/games").then((r) => r.json()),
  });

  useEffect(() => {
    setPage(1);
  }, [tab]);
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);
  useEffect(() => {
    setPage(1);
  }, [moodFilter]);

  const filtered = filterByMood(filterByTitle(games, searchQuery), moodFilter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const invalidateGames = () => queryClient.invalidateQueries({ queryKey });

  const { handleAdd, handleStatusChange, handleEdit, handleDelete } =
    useGameActions({
      onAddSuccess: invalidateGames,
      onStatusSuccess: invalidateGames,
      onEditSuccess: () => {
        setEditGame(null);
        invalidateGames();
      },
      onDeleteSuccess: invalidateGames,
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
