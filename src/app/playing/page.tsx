import type { Metadata } from 'next';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { makeQueryClient } from '@/src/infrastructure/queryClient.server';
import { prefetchGames, prefetchMoods } from '@/src/infrastructure/database/prefetch';
import { gameKeys, moodKeys } from '@/src/domains/games/queryKeys';
import { PlayingView } from './PlayingView';

export const metadata: Metadata = { title: 'Currently Playing' };

export default async function PlayingPage() {
  const queryClient = makeQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({ queryKey: gameKeys.all, queryFn: () => prefetchGames() }),
    queryClient.prefetchQuery({ queryKey: moodKeys.all, queryFn: prefetchMoods }),
  ]);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PlayingView />
    </HydrationBoundary>
  );
}
