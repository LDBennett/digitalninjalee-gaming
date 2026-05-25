import { GameDto } from "@/src/domains/games/models/game.types";

export function getTopPriority(games: GameDto[], limit = 5): GameDto[] {
  return games
    .filter((g) => g.status === "backlog")
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, limit);
}

export function getPlayingGames(games: GameDto[], display = 10, pool = 20): GameDto[] {
  const candidates = games
    .filter((g) => g.status === "playing" || g.status === "ongoing")
    .slice(0, pool);
  return [...candidates].sort(() => Math.random() - 0.5).slice(0, display);
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
