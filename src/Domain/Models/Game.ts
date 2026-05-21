import { Result, ok, err } from '@/lib/result';
import { Platform } from '@/src/Domain/ValueObjects/Platform';
import { GameStatus, canTransitionTo } from '@/src/Domain/ValueObjects/GameStatus';
import { PriorityScore, adjustPriorityScore } from '@/src/Domain/ValueObjects/PriorityScore';
import { MoodState } from '@/src/Domain/Models/Mood';

export interface GameState {
  readonly id: string;
  readonly title: string;
  readonly externalId: string | null;
  readonly platform: Platform;
  readonly status: GameStatus;
  readonly priorityScore: PriorityScore;
  readonly coverUrl: string | null;
  readonly lastPlayedAt: Date | null;
  readonly createdAt: Date;
  readonly moods: ReadonlyArray<MoodState>;
}

export interface NewGameProps {
  title: string;
  externalId: string | null;
  platform: Platform;
  status: GameStatus;
  priorityScore: PriorityScore;
  coverUrl: string | null;
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
    lastPlayedAt: null,
    createdAt: new Date(),
    moods: [...props.moods],
  });
}

export function startPlaying(game: GameState): Result<GameState, string> {
  if (!canTransitionTo(game.status, 'playing')) {
    return err(`Cannot transition from "${game.status}" to "playing"`);
  }
  return ok({ ...game, status: 'playing' as const, lastPlayedAt: new Date() });
}

export function completeGame(game: GameState): Result<GameState, string> {
  if (!canTransitionTo(game.status, 'completed')) {
    return err(`Cannot transition from "${game.status}" to "completed"`);
  }
  return ok({ ...game, status: 'completed' as const });
}

export function dropGame(game: GameState): Result<GameState, string> {
  if (!canTransitionTo(game.status, 'dropped')) {
    return err(`Cannot transition from "${game.status}" to "dropped"`);
  }
  return ok({ ...game, status: 'dropped' as const });
}

export function returnToBacklog(game: GameState): Result<GameState, string> {
  if (!canTransitionTo(game.status, 'backlog')) {
    return err(`Cannot transition from "${game.status}" to "backlog"`);
  }
  return ok({ ...game, status: 'backlog' as const });
}

export function updateDetails(
  game: GameState,
  title: string,
  platform: Platform,
  coverUrl: string | null,
): Result<GameState, string> {
  if (!title.trim()) return err('Game title cannot be empty');
  return ok({ ...game, title: title.trim(), platform, coverUrl });
}

export function adjustPriority(game: GameState, delta: number): GameState {
  return { ...game, priorityScore: adjustPriorityScore(game.priorityScore, delta) };
}

export function replaceMoods(game: GameState, moods: ReadonlyArray<MoodState>): GameState {
  return { ...game, moods: [...moods] };
}
