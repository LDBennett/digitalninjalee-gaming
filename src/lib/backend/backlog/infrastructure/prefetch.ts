import { createServerClient } from '@/src/lib/infrastructure/supabase/supabaseClient';
import { createSupabaseGameRepository } from '@/src/lib/backend/backlog/infrastructure/game.supabase.repo';
import { createSupabaseMoodRepository } from '@/src/lib/backend/backlog/infrastructure/mood.supabase.repo';
import { gameStateToDto } from '@/src/lib/backend/backlog/domain/models/game.types';
import type { GameDto } from '@/src/lib/backend/backlog/domain/models/game.types';
import type { MoodDto } from '@/src/lib/backend/backlog/domain/models/mood.types';
import type { StatusCounts } from '@/src/lib/backend/backlog/repository/game.repo';

export async function prefetchGames(status?: string | string[]): Promise<GameDto[]> {
  const repo = createSupabaseGameRepository(createServerClient());
  const result = await repo.findAll(status ? { status } : undefined);
  if (!result.success) throw result.error;
  return result.value.map(gameStateToDto);
}

export async function prefetchStatusCounts(): Promise<StatusCounts> {
  const repo = createSupabaseGameRepository(createServerClient());
  const result = await repo.getStatusCounts();
  if (!result.success) throw result.error;
  return result.value;
}

export async function prefetchMoods(): Promise<MoodDto[]> {
  const repo = createSupabaseMoodRepository(createServerClient());
  const result = await repo.findAll();
  if (!result.success) throw result.error;
  return result.value as MoodDto[];
}
