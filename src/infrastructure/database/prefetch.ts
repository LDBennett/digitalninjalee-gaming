import { createServerClient } from './supabase.client';
import { createSupabaseGameRepository } from './game.repo';
import { createSupabaseMoodRepository } from './mood.repo';
import { gameStateToDto } from '@/src/domains/games/models/game.types';
import type { GameDto } from '@/src/domains/games/models/game.types';
import type { MoodDto } from '@/src/domains/games/models/mood.types';
import type { StatusCounts } from '@/src/domains/games/repository/game.repo';

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
  return result.value as MoodDto[]; // MoodState and MoodDto are structurally identical
}
