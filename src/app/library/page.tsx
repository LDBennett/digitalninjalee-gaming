import type { Metadata } from 'next';
import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { createServerClient } from '@/src/infrastructure/database/supabase.client';
import { createSupabaseGameRepository } from '@/src/infrastructure/database/game.repo';
import { createSupabaseMoodRepository } from '@/src/infrastructure/database/mood.repo';
import { gameStateToDto } from '@/src/domains/backlog/models/game.types';
import { gameKeys, moodKeys } from '@/src/domains/backlog/hooks/queryKeys';
import { LIBRARY_TAB_STATUSES } from '@/src/domains/backlog/hooks/useLibrary';
import { LibraryView } from './LibraryView';

export const metadata: Metadata = { title: 'Library' };

export default async function LibraryPage() {
  const queryClient = new QueryClient();
  const supabase = createServerClient();
  const gameRepo = createSupabaseGameRepository(supabase);
  const moodRepo = createSupabaseMoodRepository(supabase);

  const defaultStatus = LIBRARY_TAB_STATUSES['completed'];

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: gameKeys.byStatus(defaultStatus),
      queryFn: async () => {
        const result = await gameRepo.findAll({ status: defaultStatus.split(',') });
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
      <LibraryView />
    </HydrationBoundary>
  );
}
