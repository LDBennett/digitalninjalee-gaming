import type { Metadata } from 'next';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { makeQueryClient } from '@/src/infrastructure/queryClient.server';
import { prefetchGames, prefetchMoods } from '@/src/infrastructure/database/prefetch';
import { gameKeys, moodKeys } from '@/src/domains/games/queryKeys';
import { WishlistView } from './WishlistView';

export const metadata: Metadata = { title: 'Wishlist' };

export default async function WishlistPage() {
  const queryClient = makeQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({ queryKey: gameKeys.all, queryFn: () => prefetchGames() }),
    queryClient.prefetchQuery({ queryKey: moodKeys.all, queryFn: prefetchMoods }),
  ]);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WishlistView />
    </HydrationBoundary>
  );
}
