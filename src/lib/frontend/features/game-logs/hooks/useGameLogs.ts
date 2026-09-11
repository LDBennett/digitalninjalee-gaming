"use client";

import { useMemo } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  GameLogEntry,
  GameLogPage,
} from "@/src/lib/backend/backlog/domain/models";
import { gameLogKeys } from "@/src/lib/backend/backlog/repository";
import { useAuthFetch } from "@/src/lib/frontend/shared";

interface AddNoteArgs {
  content: string;
  isPrivate?: boolean;
}

interface UpdateNoteArgs {
  logId: string;
  content?: string;
  isPrivate?: boolean;
}

export function useGameLogs(gameId: string | null) {
  const queryClient = useQueryClient();
  const { authHeaders } = useAuthFetch();

  const queryKey = useMemo(
    () => (gameId ? gameLogKeys.byGame(gameId) : ["game-logs", "disabled"]),
    [gameId],
  );

  const {
    data,
    isLoading: logsLoading,
    isError: logsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      if (!gameId) throw new Error("gameId is required");
      const url = new URL(`/api/games/${gameId}/logs`, window.location.origin);
      url.searchParams.set("limit", "50");
      if (pageParam?.createdAt && pageParam?.id) {
        url.searchParams.set("cursor_created_at", pageParam.createdAt);
        url.searchParams.set("cursor_id", pageParam.id);
      }

      const res = await fetch(url.toString(), { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as GameLogPage;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as { createdAt: string; id: string } | null,
    enabled: Boolean(gameId),
  });

  const logs = useMemo(
    () => data?.pages.flatMap((page) => page.entries) ?? [],
    [data],
  );

  const addNoteMutation = useMutation({
    mutationFn: async ({ content, isPrivate }: AddNoteArgs) => {
      if (!gameId) throw new Error("gameId is required");
      const res = await fetch(`/api/games/${gameId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ content, is_private: isPrivate ?? false }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      return (await res.json()) as GameLogEntry;
    },
    onSuccess: () => {
      if (gameId) {
        queryClient.invalidateQueries({ queryKey: gameLogKeys.byGame(gameId) });
      }
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ logId, content, isPrivate }: UpdateNoteArgs) => {
      if (!gameId) throw new Error("gameId is required");
      const res = await fetch(`/api/games/${gameId}/logs/${logId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ content, is_private: isPrivate }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      return (await res.json()) as GameLogEntry;
    },
    onSuccess: () => {
      if (gameId) {
        queryClient.invalidateQueries({ queryKey: gameLogKeys.byGame(gameId) });
      }
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (logId: string) => {
      if (!gameId) throw new Error("gameId is required");
      const res = await fetch(`/api/games/${gameId}/logs/${logId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      return true;
    },
    onSuccess: () => {
      if (gameId) {
        queryClient.invalidateQueries({ queryKey: gameLogKeys.byGame(gameId) });
      }
    },
  });

  return {
    logs,
    logsLoading,
    logsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    addNote: addNoteMutation.mutateAsync,
    isAddingNote: addNoteMutation.isPending,
    updateNote: updateNoteMutation.mutateAsync,
    isUpdatingNote: updateNoteMutation.isPending,
    deleteNote: deleteNoteMutation.mutateAsync,
    isDeletingNote: deleteNoteMutation.isPending,
  };
}
