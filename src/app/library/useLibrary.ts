"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GameDto, GameStatus } from "@/src/domains/backlog/models/game.types";
import { MoodDto } from "@/src/domains/backlog/models/mood.types";
import { useAuth } from "@/src/domains/shared/auth/AuthContext";
import { gameKeys, moodKeys } from "@/src/domains/backlog/queryKeys";

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
  const { session } = useAuth();
  const isAuthenticated = session !== null;
  const queryClient = useQueryClient();

  const PAGE_SIZE = 20;

  const [tab, setTab] = useState<LibraryTab>("completed");
  const [showAdd, setShowAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  const { data: moods = [] } = useQuery<MoodDto[]>({
    queryKey: moodKeys.all,
    queryFn: () => fetch("/api/moods").then((r) => r.json()),
    staleTime: Infinity,
  });

  useEffect(() => {
    setPage(1);
  }, [tab]);
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const filtered = searchQuery.trim()
    ? games.filter((g) =>
        g.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : games;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const authHeaders = (): Record<string, string> =>
    session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : {};

  const invalidateGames = () => queryClient.invalidateQueries({ queryKey });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: GameStatus }) =>
      fetch(`/api/games/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ status }),
      }),
    onSuccess: invalidateGames,
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) =>
      fetch(`/api/games/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      setEditGame(null);
      invalidateGames();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/games/${id}`, { method: "DELETE", headers: authHeaders() }),
    onSuccess: invalidateGames,
  });

  const addMutation = useMutation({
    mutationFn: (data: object) =>
      fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(data),
      }),
    onSuccess: invalidateGames,
  });

  const handleStatusChange = (id: string, status: GameStatus) =>
    statusMutation.mutate({ id, status });

  const handleEdit = (data: object) => {
    if (!editGame) return;
    editMutation.mutate({ id: editGame.id, data });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this game?")) return;
    deleteMutation.mutate(id);
  };

  const handleAdd = (data: object) => addMutation.mutate(data);

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
    editGame,
    setEditGame,
    gamesLoading,
    isAuthenticated,
    handleStatusChange,
    handleEdit,
    handleDelete,
    handleAdd,
    showAdd,
    setShowAdd,
  };
}
