import { GameState } from '@/src/Domain/Models/Game';
import { MoodState } from '@/src/Domain/Models/Mood';
import { createPlatform } from '@/src/Domain/ValueObjects/Platform';
import { createGameStatus } from '@/src/Domain/ValueObjects/GameStatus';
import { createPriorityScore } from '@/src/Domain/ValueObjects/PriorityScore';
import { GameRowWithMoods } from '@/src/Infrastructure/Persistence/Supabase/Types';

export function gameRowToDomain(row: GameRowWithMoods): GameState {
  const platformResult = createPlatform(row.platform);
  if (!platformResult.success) throw new Error(`DB contains invalid platform: ${row.platform}`);

  const statusResult = createGameStatus(row.status);
  if (!statusResult.success) throw new Error(`DB contains invalid status: ${row.status}`);

  const scoreResult = createPriorityScore(row.priority_score);
  if (!scoreResult.success) throw new Error(`DB contains invalid priority_score: ${row.priority_score}`);

  const moods: MoodState[] = (row.game_moods ?? [])
    .map((gm) => gm.moods)
    .filter(Boolean)
    .map((m) => ({ id: m.id, name: m.name }));

  return {
    id: row.id,
    title: row.title,
    externalId: row.external_id,
    platform: platformResult.value,
    status: statusResult.value,
    priorityScore: scoreResult.value,
    coverUrl: row.cover_url,
    lastPlayedAt: row.last_played_at ? new Date(row.last_played_at) : null,
    createdAt: new Date(row.created_at),
    moods,
  };
}

export function gameStateToRow(game: GameState): Omit<GameRowWithMoods, 'game_moods'> {
  return {
    id: game.id,
    title: game.title,
    external_id: game.externalId,
    platform: game.platform,
    status: game.status,
    priority_score: game.priorityScore,
    cover_url: game.coverUrl,
    last_played_at: game.lastPlayedAt?.toISOString() ?? null,
    created_at: game.createdAt.toISOString(),
  };
}

export function gameMoodJunctionRows(game: GameState): Array<{ game_id: string; mood_id: string }> {
  return game.moods.map((mood) => ({ game_id: game.id, mood_id: mood.id }));
}
