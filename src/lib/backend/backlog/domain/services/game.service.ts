import { Result, ok, err } from "@/src/lib/backend/shared/result";
import {
  GameState,
  GameStatus,
  Platform,
  PriorityScore,
  ReplayStatus,
  PlayGoal,
  canTransitionTo,
  adjustPriorityScore,
} from "@/src/lib/backend/backlog/domain/models/game.types";
import { MoodState } from "@/src/lib/backend/backlog/domain/models/mood.types";

export interface NewGameProps {
  title: string;
  platform: Platform;
  status: GameStatus;
  priorityScore: PriorityScore;
  backgroundUrl: string | null;
  coverArtUrl?: string | null;
  gameDescription?: string | null;
  moods: ReadonlyArray<MoodState>;
  id?: string;
  replayStatus?: ReplayStatus;
  personalNote?: string | null;
  rating?: number | null;
  playGoals?: ReadonlyArray<PlayGoal>;
}

export function newGame(props: NewGameProps): Result<GameState, string> {
  if (!props.title.trim()) return err("Game title cannot be empty");
  return ok({
    id: props.id ?? crypto.randomUUID(),
    title: props.title.trim(),
    platform: props.platform,
    status: props.status,
    priorityScore: props.priorityScore,
    backgroundUrl: props.backgroundUrl,
    coverArtUrl: props.coverArtUrl ?? null,
    gameDescription: props.gameDescription ?? null,
    lastPlayedAt: null,
    createdAt: new Date(),
    moods: [...props.moods],
    replayStatus: props.replayStatus ?? null,
    personalNote: props.personalNote ?? null,
    rating: props.rating ?? null,
    playGoals: [...(props.playGoals ?? [])],
  });
}

export function setReplayStatus(
  game: GameState,
  replayStatus: ReplayStatus,
): GameState {
  return { ...game, replayStatus };
}

export function setPlayGoals(
  game: GameState,
  playGoals: ReadonlyArray<PlayGoal>,
): GameState {
  return { ...game, playGoals: [...playGoals] };
}

export function transitionGame(
  game: GameState,
  nextStatus: GameStatus,
): Result<GameState, string> {
  if (!canTransitionTo(game.status, nextStatus)) {
    return err(`Cannot transition from "${game.status}" to "${nextStatus}"`);
  }
  return ok({
    ...game,
    status: nextStatus,
    lastPlayedAt: nextStatus === "playing" ? new Date() : game.lastPlayedAt,
  });
}

export function updateGameDetails(
  game: GameState,
  title: string,
  platform: Platform,
  backgroundUrl: string | null,
  coverArtUrl?: string | null,
  gameDescription?: string | null,
  personalNote?: string | null,
  rating?: number | null,
): Result<GameState, string> {
  if (!title.trim()) return err("Game title cannot be empty");
  return ok({
    ...game,
    title: title.trim(),
    platform,
    backgroundUrl,
    ...(coverArtUrl !== undefined && { coverArtUrl }),
    ...(gameDescription !== undefined && { gameDescription }),
    ...(personalNote !== undefined && { personalNote }),
    ...(rating !== undefined && { rating }),
  });
}

export function adjustPriority(game: GameState, delta: number): GameState {
  return {
    ...game,
    priorityScore: adjustPriorityScore(game.priorityScore, delta),
  };
}

export function replaceMoods(
  game: GameState,
  moods: ReadonlyArray<MoodState>,
): GameState {
  return { ...game, moods: [...moods] };
}

export function selectRandomGame(
  games: ReadonlyArray<GameState>,
): GameState | null {
  if (games.length === 0) return null;
  return games[Math.floor(Math.random() * games.length)];
}

export function buildStatusPayload(
  status: GameStatus,
): Record<string, unknown> {
  const payload: Record<string, unknown> = { status };
  if (status === "completed" || status === "main-complete") {
    payload.last_played_at = new Date().toISOString();
  }
  return payload;
}
