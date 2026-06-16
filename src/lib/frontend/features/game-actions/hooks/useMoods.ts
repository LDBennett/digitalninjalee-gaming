"use client";

import { useQuery } from "@tanstack/react-query";
import { MoodDto } from "@/src/lib/backend/backlog/domain/models";
import { moodKeys } from "@/src/lib/backend/backlog/repository";
import { useAuthFetch } from "@/src/lib/frontend/shared/hooks/useAuthFetch";
import { useAuthStore } from "@/src/lib/frontend/shared/store/auth.store";

export function useMoods() {
  const { authHeaders } = useAuthFetch();
  const { session, authLoading } = useAuthStore();

  const { data: moods = [], isPending: moodsLoading } = useQuery<MoodDto[]>({
    queryKey: moodKeys.all,
    queryFn: () =>
      fetch("/api/moods", { headers: authHeaders() }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),
    staleTime: Infinity,
    enabled: !authLoading,
  });
  return { moods, moodsLoading };
}
