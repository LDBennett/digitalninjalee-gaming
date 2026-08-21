import { Result, ok, err } from "@/src/lib/backend/shared/result";
import type { GameStatus } from "./gameStatus.types";

export const PLAY_GOALS = [
  "story-completion",
  "completionist",
  "casual",
  "multiplayer-coop",
  "competitive",
  "exploration",
] as const;
export type PlayGoal = (typeof PLAY_GOALS)[number];

export const PLAY_GOAL_LABELS: Record<PlayGoal, string> = {
  "story-completion": "Story Completion",
  completionist: "Platinum / 1000G / 100%",
  casual: "Casual Pick Up & Play",
  "multiplayer-coop": "Multiplayer / Co-op",
  competitive: "Competitive / Ranked",
  exploration: "Exploration / Collectibles",
};

export const PLAY_GOAL_STATUSES: ReadonlyArray<GameStatus> = [
  "backlog",
  "playing",
  "ongoing",
];

export function createPlayGoals(values: string[]): Result<PlayGoal[], string> {
  const invalid = values.filter(
    (v) => !(PLAY_GOALS as readonly string[]).includes(v),
  );
  if (invalid.length > 0) {
    return err(
      `Invalid play goal(s): ${invalid.join(", ")}. Must be one of: ${PLAY_GOALS.join(", ")}`,
    );
  }
  return ok(values as PlayGoal[]);
}
