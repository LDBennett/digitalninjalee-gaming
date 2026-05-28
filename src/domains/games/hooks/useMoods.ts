'use client';

import { useQuery } from '@tanstack/react-query';
import { MoodDto } from '../models/mood.types';
import { moodKeys } from '../queryKeys';
import { useAuthFetch } from '@/src/domains/shared/auth/useAuthFetch';
import { useAuthStore } from '@/src/domains/shared/auth/auth.store';

export function useMoods() {
  const { authHeaders } = useAuthFetch();
  const { session, authLoading } = useAuthStore();

  const { data: moods = [], isPending: moodsLoading } = useQuery<MoodDto[]>({
    queryKey: moodKeys.all,
    queryFn: () => fetch('/api/moods', { headers: authHeaders() }).then((r) => r.json()),
    staleTime: Infinity,
    enabled: !authLoading && !!session,
  });
  return { moods, moodsLoading };
}
