import { GameState, createPlatform, createGameStatus, createPriorityScore } from '@/src/domains/games/models/game.types';
import { MoodState } from '@/src/domains/games/models/mood.types';
import { GameRowWithMoods } from '@/src/infrastructure/database/types';

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
    coverArtUrl: row.cover_art_url,
    gameDescription: row.game_description,
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
    cover_art_url: game.coverArtUrl,
    game_description: game.gameDescription,
    last_played_at: game.lastPlayedAt?.toISOString() ?? null,
    created_at: game.createdAt.toISOString(),
  };
}

export function gameMoodJunctionRows(game: GameState): Array<{ game_id: string; mood_id: string }> {
  return game.moods.map((mood) => ({ game_id: game.id, mood_id: mood.id }));
}
