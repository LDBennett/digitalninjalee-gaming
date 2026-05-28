'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GameDto } from '@/src/domains/games/models/game.types';
import { gameKeys } from '@/src/domains/games/queryKeys';
import { useAuthFetch } from '@/src/domains/shared/auth/useAuthFetch';
import { useAuthStore } from '@/src/domains/shared/auth/auth.store';

export function useGameQuery(status?: string) {
  const queryClient = useQueryClient();
  const queryKey = status ? gameKeys.byStatus(status) : gameKeys.all;
  const { authHeaders } = useAuthFetch();
  const { session, authLoading } = useAuthStore();

  const { data: games = [], isPending: gamesLoading } = useQuery<GameDto[]>({
    queryKey,
    queryFn: () =>
      fetch(status ? `/api/games?status=${status}` : '/api/games', {
        headers: authHeaders(),
      }).then((r) => r.json()),
    enabled: !authLoading && !!session,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  return { games, gamesLoading, invalidate, queryKey };
}
