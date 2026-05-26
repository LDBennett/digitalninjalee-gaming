import { Result, ok, err } from '@/src/domains/shared/result';
import {
  GameState,
  GameStatus,
  Platform,
  PriorityScore,
  canTransitionTo,
  adjustPriorityScore,
} from '@/src/domains/games/models/game.types';
import { MoodState } from '@/src/domains/games/models/mood.types';

export interface NewGameProps {
  title: string;
  externalId: string | null;
  platform: Platform;
  status: GameStatus;
  priorityScore: PriorityScore;
  coverUrl: string | null;
  coverArtUrl?: string | null;
  gameDescription?: string | null;
  moods: ReadonlyArray<MoodState>;
  id?: string;
}

export function newGame(props: NewGameProps): Result<GameState, string> {
  if (!props.title.trim()) return err('Game title cannot be empty');
  return ok({
    id: props.id ?? crypto.randomUUID(),
    title: props.title.trim(),
    externalId: props.externalId,
    platform: props.platform,
    status: props.status,
    priorityScore: props.priorityScore,
    coverUrl: props.coverUrl,
    coverArtUrl: props.coverArtUrl ?? null,
    gameDescription: props.gameDescription ?? null,
    lastPlayedAt: null,
    createdAt: new Date(),
    moods: [...props.moods],
  });
}

export function transitionGame(game: GameState, nextStatus: GameStatus): Result<GameState, string> {
  if (!canTransitionTo(game.status, nextStatus)) {
    return err(`Cannot transition from "${game.status}" to "${nextStatus}"`);
  }
  return ok({
    ...game,
    status: nextStatus,
    lastPlayedAt: nextStatus === 'playing' ? new Date() : game.lastPlayedAt,
  });
}

export function updateGameDetails(
  game: GameState,
  title: string,
  platform: Platform,
  coverUrl: string | null,
  coverArtUrl?: string | null,
  gameDescription?: string | null,
): Result<GameState, string> {
  if (!title.trim()) return err('Game title cannot be empty');
  return ok({
    ...game,
    title: title.trim(),
    platform,
    coverUrl,
    ...(coverArtUrl !== undefined   && { coverArtUrl }),
    ...(gameDescription !== undefined && { gameDescription }),
  });
}

export function adjustPriority(game: GameState, delta: number): GameState {
  return { ...game, priorityScore: adjustPriorityScore(game.priorityScore, delta) };
}

export function replaceMoods(game: GameState, moods: ReadonlyArray<MoodState>): GameState {
  return { ...game, moods: [...moods] };
}

export function selectRandomGame(games: ReadonlyArray<GameState>): GameState | null {
  if (games.length === 0) return null;
  return games[Math.floor(Math.random() * games.length)];
}

export function buildStatusPayload(status: GameStatus): Record<string, unknown> {
  const payload: Record<string, unknown> = { status };
  if (status === 'completed' || status === 'main-complete') {
    payload.last_played_at = new Date().toISOString();
  }
  return payload;
}
