import { GameDto } from "@/src/lib/backend/backlog/domain/models/game.types";

export interface GameStats {
  backlog: number;
  playing: number;
  ongoing: number;
  completed: number;
  completedFull: number;
  wishlist: number;
  total: number;
}

export function deriveStats(games: GameDto[]): GameStats {
  const counts: Record<string, number> = {};
  for (const g of games) counts[g.status] = (counts[g.status] ?? 0) + 1;

  const wantToReplayExtra = games.filter(
    (g) => g.replay_status === "want-to-replay" && g.status !== "backlog",
  ).length;
  const replayingExtra = games.filter(
    (g) => g.replay_status === "replaying" && g.status !== "playing",
  ).length;

  return {
    backlog: (counts["backlog"] ?? 0) + wantToReplayExtra,
    playing: (counts["playing"] ?? 0) + replayingExtra,
    ongoing: counts["ongoing"] ?? 0,
    completed: (counts["completed"] ?? 0) + (counts["main-complete"] ?? 0),
    completedFull: counts["completed"] ?? 0,
    wishlist:
      (counts["interested"] ?? 0) +
      (counts["pre-ordered"] ?? 0) +
      (counts["keep-an-eye-on"] ?? 0),
    total: games.length,
  };
}
