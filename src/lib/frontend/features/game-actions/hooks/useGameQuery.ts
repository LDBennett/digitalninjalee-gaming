"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GameDto } from "@/src/lib/backend/backlog/domain/models";
import { gameKeys } from "@/src/lib/backend/backlog/repository";
import { useAuthFetch, useAuthStore } from "@/src/lib/frontend/shared";

export function useGameQuery() {
  const queryClient = useQueryClient();
  const { authHeaders } = useAuthFetch();
  const { session, authLoading } = useAuthStore();
  const queryKey = useMemo(
    () => [...gameKeys.all, session?.user?.id ?? "anon"],
    [session?.user?.id],
  );

  const { data: games = [], isPending: gamesLoading } = useQuery<GameDto[]>({
    queryKey,
    queryFn: () =>
      fetch("/api/games", { headers: authHeaders() }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),
    enabled: !authLoading,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: gameKeys.all });

  return { games, gamesLoading, invalidate, queryKey };
}
