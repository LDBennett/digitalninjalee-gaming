import { Result, ok, err } from '@/lib/result';

export const GAME_STATUSES = ['backlog', 'playing', 'completed', 'dropped'] as const;
export type GameStatus = typeof GAME_STATUSES[number];

const VALID_TRANSITIONS: Readonly<Record<GameStatus, ReadonlyArray<GameStatus>>> = {
  backlog:   ['playing', 'dropped'],
  playing:   ['completed', 'dropped'],
  completed: [],
  dropped:   ['backlog'],
};

export function createGameStatus(value: string): Result<GameStatus, string> {
  if (!GAME_STATUSES.includes(value as GameStatus)) {
    return err(`Invalid status: "${value}". Must be one of: ${GAME_STATUSES.join(', ')}`);
  }
  return ok(value as GameStatus);
}

export function canTransitionTo(from: GameStatus, to: GameStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}
