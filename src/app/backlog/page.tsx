import type { Metadata } from 'next';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { makeQueryClient } from '@/src/infrastructure/queryClient.server';
import { prefetchGames, prefetchMoods } from '@/src/infrastructure/database/prefetch';
import { gameKeys, moodKeys } from '@/src/domains/games/queryKeys';
import { BacklogView } from './BacklogView';

export const metadata: Metadata = { title: 'Backlog' };

export default async function BacklogPage() {
  const queryClient = makeQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({ queryKey: gameKeys.all, queryFn: () => prefetchGames() }),
    queryClient.prefetchQuery({ queryKey: moodKeys.all, queryFn: prefetchMoods }),
  ]);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BacklogView />
    </HydrationBoundary>
  );
}
