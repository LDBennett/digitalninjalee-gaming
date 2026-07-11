"use client";

import { useQuery } from "@tanstack/react-query";
import type { RecentPlayDto } from "@/src/lib/backend/activity/domain/models";

export function useRecentActivity() {
  const { data: recentPlays = [], isPending: recentLoading } = useQuery<
    RecentPlayDto[]
  >({
    queryKey: ["recent-activity"],
    queryFn: () =>
      fetch("/api/activity/recent").then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),
    staleTime: 60 * 1000,
  });

  return { recentPlays, recentLoading };
}
