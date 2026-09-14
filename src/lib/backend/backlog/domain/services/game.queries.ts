import { GameDto } from "@/src/lib/backend/backlog/domain/models/game.types";

export function getTopPriority(games: GameDto[], limit = 20): GameDto[] {
  return games
    .filter(
      (g) => g.status === "backlog" || g.replay_status === "want-to-replay",
    )
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, limit);
}

export function getBacklogGames(games: GameDto[], limit = 20): GameDto[] {
  return games
    .filter(
      (g) => g.status === "backlog" || g.replay_status === "want-to-replay",
    )
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, limit);
}

export function getPlayingGames(games: GameDto[], limit = 20): GameDto[] {
  return games
    .filter(
      (g) =>
        g.status === "playing" ||
        g.status === "ongoing" ||
        g.replay_status === "replaying",
    )
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

export function filterByPlayGoal(
  games: GameDto[],
  playGoalFilter: string | null,
): GameDto[] {
  if (!playGoalFilter) return games;
  return games.filter((g) => g.play_goals?.includes(playGoalFilter as any));
}

export function filterByTitle(games: GameDto[], query: string): GameDto[] {
  const q = query.trim().toLowerCase();
  if (!q) return games;
  return games.filter((g) => g.title.toLowerCase().includes(q));
}

export function getTopWishlist(games: GameDto[], limit = 5): GameDto[] {
  return games
    .filter((g) =>
      ["interested", "pre-ordered", "keep-an-eye-on"].includes(g.status),
    )
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, limit);
}

export function getLastCompleted(games: GameDto[], limit = 5): GameDto[] {
  return games
    .filter((g) => g.status === "completed" || g.status === "main-complete")
    .sort((a, b) => {
      const aDate = a.last_played_at ?? a.created_at;
      const bDate = b.last_played_at ?? b.created_at;
      return bDate.localeCompare(aDate);
    })
    .slice(0, limit);
}

export type DurationFilter = "short" | "medium" | "long" | "epic";

export function filterByDuration(
  games: GameDto[],
  durationFilter: DurationFilter | null,
): GameDto[] {
  if (!durationFilter) return games;
  return games.filter((g) => {
    const hours = g.time_to_beat?.main;
    if (hours === null || hours === undefined) return false;
    switch (durationFilter) {
      case "short":
        return hours < 10;
      case "medium":
        return hours >= 10 && hours <= 25;
      case "long":
        return hours > 25 && hours <= 50;
      case "epic":
        return hours > 50;
      default:
        return true;
    }
  });
}

