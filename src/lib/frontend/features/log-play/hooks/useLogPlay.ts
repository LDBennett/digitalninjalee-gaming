"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gameKeys } from "@/src/lib/backend/backlog/repository";
import { useAuthFetch } from "@/src/lib/frontend/shared/hooks/useAuthFetch";

export interface LogPlayInput {
  gameId?: string;
  gameName: string;
}

export function useLogPlay(options: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient();
  const { authJsonFetch } = useAuthFetch();

  const mutation = useMutation({
    mutationFn: async ({ gameId, gameName }: LogPlayInput) => {
      const res = await authJsonFetch("/api/activity/log", "POST", {
        game_id: gameId,
        game_name: gameName,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
      // A matched sighting bumps the game's last_played_at.
      queryClient.invalidateQueries({ queryKey: gameKeys.all });
      options.onSuccess?.();
    },
  });

  return {
    logPlay: (input: LogPlayInput) => mutation.mutate(input),
    logging: mutation.isPending,
  };
}
