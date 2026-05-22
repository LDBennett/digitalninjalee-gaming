import type { Metadata } from 'next';
import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { createServerClient } from '@/src/infrastructure/database/supabase.client';
import { createSupabaseGameRepository } from '@/src/infrastructure/database/game.repo';
import { createSupabaseMoodRepository } from '@/src/infrastructure/database/mood.repo';
import { gameStateToDto } from '@/src/domains/backlog/models/game.types';
import { gameKeys, moodKeys } from '@/src/domains/backlog/hooks/queryKeys';
import { PlayingView } from './PlayingView';

export const metadata: Metadata = { title: 'Currently Playing' };

export default async function PlayingPage() {
  const queryClient = new QueryClient();
  const supabase = createServerClient();
  const gameRepo = createSupabaseGameRepository(supabase);
  const moodRepo = createSupabaseMoodRepository(supabase);

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: gameKeys.byStatus('playing'),
      queryFn: async () => {
        const result = await gameRepo.findAll({ status: 'playing' });
        return result.success ? result.value.map(gameStateToDto) : [];
      },
    }),
    queryClient.prefetchQuery({
      queryKey: moodKeys.all,
      queryFn: async () => {
        const result = await moodRepo.findAll();
        return result.success ? result.value : [];
      },
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PlayingView />
    </HydrationBoundary>
  );
}
