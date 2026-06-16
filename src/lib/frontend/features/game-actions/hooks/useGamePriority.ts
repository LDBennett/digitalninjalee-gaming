"use client";

import { useMutation, useQueryClient, QueryKey } from "@tanstack/react-query";
import { GameDto } from "@/src/lib/backend/backlog/domain/models";
import { useAuthFetch } from "@/src/lib/frontend/shared/hooks/useAuthFetch";

export function useGamePriority(queryKey: QueryKey) {
  const { authJsonFetch } = useAuthFetch();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, newScore }: { id: string; newScore: number }) =>
      authJsonFetch(`/api/games/${id}`, "PUT", { priority_score: newScore }),
    onMutate: ({ id, newScore }) => {
      queryClient.setQueryData<GameDto[]>(queryKey, (prev = []) =>
        prev
          .map((g) => (g.id === id ? { ...g, priority_score: newScore } : g))
          .sort((a, b) => b.priority_score - a.priority_score),
      );
    },
  });

  const handlePriorityChange = (
    id: string,
    delta: number,
    games: GameDto[],
  ) => {
    const game = games.find((g) => g.id === id);
    if (!game) return;
    const newScore = Math.min(100, Math.max(1, game.priority_score + delta));
    mutation.mutate({ id, newScore });
  };

  return { handlePriorityChange };
}
