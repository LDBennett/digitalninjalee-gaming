import { GameDto } from "@/src/domains/games/models/game.types";

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
  return {
    backlog: counts["backlog"] ?? 0,
    playing: counts["playing"] ?? 0,
    ongoing: counts["ongoing"] ?? 0,
    completed: (counts["completed"] ?? 0) + (counts["main-complete"] ?? 0),
    completedFull: counts["completed"] ?? 0,
    wishlist: (counts["interested"] ?? 0) + (counts["pre-ordered"] ?? 0) + (counts["keep-an-eye-on"] ?? 0),
    total: games.length,
  };
}

export function getTopPriority(games: GameDto[], limit = 20): GameDto[] {
  return games
    .filter((g) => g.status === "backlog")
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, limit);
}

export function getBacklogGames(games: GameDto[], limit = 20): GameDto[] {
  return games
    .filter((g) => g.status === "backlog")
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, limit);
}

export function getPlayingGames(games: GameDto[], limit = 20): GameDto[] {
  return games
    .filter((g) => g.status === "playing" || g.status === "ongoing")
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, limit);
}

export function getRecentlyPlayed(games: GameDto[], limit = 5): GameDto[] {
  return games
    .filter((g) => g.last_played_at !== null)
    .sort(
      (a, b) =>
        new Date(b.last_played_at!).getTime() -
        new Date(a.last_played_at!).getTime(),
    )
    .slice(0, limit);
}

export function filterByMood(
  games: GameDto[],
  moodFilter: string | null,
): GameDto[] {
  if (!moodFilter) return games;
  return games.filter((g) => g.moods?.some((m) => m.name === moodFilter));
}

export function filterByTitle(games: GameDto[], query: string): GameDto[] {
  const q = query.trim().toLowerCase();
  if (!q) return games;
  return games.filter((g) => g.title.toLowerCase().includes(q));
}
