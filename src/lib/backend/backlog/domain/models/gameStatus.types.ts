import { Result, ok, err } from "@/src/lib/backend/shared/result";

export const GAME_STATUSES = [
  "backlog",
  "playing",
  "completed",
  "dropped",
  "main-complete",
  "ongoing",
  "interested",
  "pre-ordered",
  "keep-an-eye-on",
] as const;

export type GameStatus = (typeof GAME_STATUSES)[number];

export const WISHLIST_STATUSES: ReadonlyArray<GameStatus> = [
  "interested",
  "pre-ordered",
  "keep-an-eye-on",
];

export const LIBRARY_STATUSES: ReadonlyArray<GameStatus> = [
  "backlog",
  "playing",
  "completed",
  "main-complete",
  "ongoing",
  "dropped",
];

export const STATUS_LABELS: Record<GameStatus, string> = {
  backlog: "Backlog",
  playing: "Playing",
  completed: "100% Completed",
  dropped: "Dropped",
  "main-complete": "Complete",
  ongoing: "Ongoing",
  interested: "Interested",
  "pre-ordered": "Pre-Ordered",
  "keep-an-eye-on": "Keep an Eye On",
};

export const VALID_TRANSITIONS: Readonly<
  Record<GameStatus, ReadonlyArray<GameStatus>>
> = {
  backlog: ["playing", "dropped"],
  playing: ["completed", "main-complete", "ongoing", "backlog", "dropped"],
  completed: [],
  dropped: ["backlog"],
  "main-complete": ["playing", "ongoing", "completed"],
  ongoing: ["completed", "dropped"],
  interested: ["playing", "backlog", "pre-ordered", "keep-an-eye-on"],
  "pre-ordered": ["playing", "backlog", "interested", "keep-an-eye-on"],
  "keep-an-eye-on": ["interested", "pre-ordered"],
};

export type ReplayStatus = "want-to-replay" | "replaying" | null;

export function createGameStatus(value: string): Result<GameStatus, string> {
  if (!GAME_STATUSES.includes(value as GameStatus)) {
    return err(
      `Invalid status: "${value}". Must be one of: ${GAME_STATUSES.join(", ")}`,
    );
  }
  return ok(value as GameStatus);
}

export function canTransitionTo(from: GameStatus, to: GameStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

export function isWishlistStatus(status: GameStatus): boolean {
  return (WISHLIST_STATUSES as ReadonlyArray<string>).includes(status);
}
