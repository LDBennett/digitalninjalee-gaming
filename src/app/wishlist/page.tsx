import type { Metadata } from 'next';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { makeQueryClient, prefetchGames, prefetchMoods } from '@/src/lib/backend/backlog/infrastructure';
import { gameKeys, moodKeys } from '@/src/lib/backend/backlog/repository';
import { WishlistView } from '@/src/lib/frontend/pages/wishlist';

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
