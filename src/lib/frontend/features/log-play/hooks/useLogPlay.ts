"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activityKeys } from "@/src/lib/backend/activity/repository";
import { gameKeys } from "@/src/lib/backend/backlog/repository";
import type { Platform } from "@/src/lib/backend/backlog/domain/models";
import { useAuthFetch } from "@/src/lib/frontend/shared/hooks/useAuthFetch";

export interface LogPlayInput {
  gameId?: string;
  gameName: string;
  platform?: Platform;
}

export function useLogPlay(options: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient();
  const { authJsonFetch } = useAuthFetch();

  const mutation = useMutation({
    mutationFn: async ({ gameId, gameName, platform }: LogPlayInput) => {
      const res = await authJsonFetch("/api/activity/log", "POST", {
        game_id: gameId,
        game_name: gameName,
        platform,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all });
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
