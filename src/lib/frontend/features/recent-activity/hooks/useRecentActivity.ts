"use client";

import { useQuery } from "@tanstack/react-query";
import { activityKeys } from "@/src/lib/backend/activity/repository";
import type { RecentPlayDto } from "@/src/lib/backend/activity/domain/models";

export function useRecentActivity(limit = 5) {
  const { data: recentPlays = [], isPending: recentLoading } = useQuery<
    RecentPlayDto[]
  >({
    queryKey: activityKeys.recent(limit),
    queryFn: () =>
      fetch(`/api/activity/recent?limit=${limit}`).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),
    staleTime: 60 * 1000,
  });

  return { recentPlays, recentLoading };
}
