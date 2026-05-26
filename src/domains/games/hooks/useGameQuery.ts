'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GameDto } from '@/src/domains/games/models/game.types';
import { gameKeys } from '@/src/domains/games/queryKeys';

export function useGameQuery(status?: string) {
  const queryClient = useQueryClient();
  const queryKey = status ? gameKeys.byStatus(status) : gameKeys.all;

  const { data: games = [], isPending: gamesLoading } = useQuery<GameDto[]>({
    queryKey,
    queryFn: () =>
      fetch(status ? `/api/games?status=${status}` : '/api/games').then((r) =>
        r.json(),
      ),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  return { games, gamesLoading, invalidate, queryKey };
}
