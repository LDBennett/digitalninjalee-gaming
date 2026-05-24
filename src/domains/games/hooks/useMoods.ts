'use client';

import { useQuery } from '@tanstack/react-query';
import { MoodDto } from '../models/mood.types';
import { moodKeys } from '../queryKeys';

export function useMoods() {
  const { data: moods = [], isPending: moodsLoading } = useQuery<MoodDto[]>({
    queryKey: moodKeys.all,
    queryFn: () => fetch('/api/moods').then((r) => r.json()),
    staleTime: Infinity,
  });
  return { moods, moodsLoading };
}
