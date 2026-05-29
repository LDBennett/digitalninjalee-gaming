import type { Metadata } from 'next';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { makeQueryClient, prefetchGames, prefetchMoods } from '@/src/lib/backend/backlog/infrastructure';
import { gameKeys, moodKeys } from '@/src/lib/backend/backlog/repository';
import { PlayingView } from '@/src/lib/frontend/pages/playing';

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
