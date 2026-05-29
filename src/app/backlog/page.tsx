import type { Metadata } from 'next';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { makeQueryClient, prefetchGames, prefetchMoods } from '@/src/lib/backend/backlog/infrastructure';
import { gameKeys, moodKeys } from '@/src/lib/backend/backlog/repository';
import { BacklogView } from '@/src/lib/frontend/pages/backlog';

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
