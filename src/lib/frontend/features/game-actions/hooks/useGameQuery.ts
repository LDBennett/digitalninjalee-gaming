"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GameDto } from "@/src/lib/backend/backlog/domain/models";
import { gameKeys } from "@/src/lib/backend/backlog/repository";
import { useAuthFetch } from "@/src/lib/frontend/shared/auth/useAuthFetch";
import { useAuthStore } from "@/src/lib/frontend/shared/auth/auth.store";

export function useGameQuery(status?: string) {
  const queryClient = useQueryClient();
  const queryKey = status ? gameKeys.byStatus(status) : gameKeys.all;
  const { authHeaders } = useAuthFetch();
  const { session, authLoading } = useAuthStore();

  const { data: games = [], isPending: gamesLoading } = useQuery<GameDto[]>({
    queryKey,
    queryFn: () =>
      fetch(status ? `/api/games?status=${status}` : "/api/games", {
        headers: authHeaders(),
      }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),
    enabled: !authLoading && !!session,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  return { games, gamesLoading, invalidate, queryKey };
}
