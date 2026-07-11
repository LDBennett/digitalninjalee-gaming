import type { PlaySessionState } from "../models/session.types";

export const SESSION_MERGE_GAP_MINUTES = 20;

/**
 * A poll that sees the same game within the merge gap extends the open
 * session instead of starting a new one.
 */
export function shouldExtendSession(
  lastSeenAt: string,
  now: Date,
  gapMinutes: number = SESSION_MERGE_GAP_MINUTES,
): boolean {
  const lastSeen = new Date(lastSeenAt).getTime();
  if (Number.isNaN(lastSeen)) return false;
  const gapMs = gapMinutes * 60 * 1000;
  return now.getTime() - lastSeen <= gapMs;
}

/**
 * Normalizes a title for matching: lowercase, trademark symbols and
 * punctuation stripped, whitespace collapsed.
 */
export function normalizeGameTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[™®©]/g, "")
    .replace(/[:\-–—'".,!?()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Matches a Discord activity name against library titles. Exact normalized
 * match wins; otherwise a prefix match in either direction (handles edition
 * suffixes like "Game — Deluxe Edition"). Returns the matched game id.
 */
export function matchGameByTitle(
  games: Array<{ id: string; title: string }>,
  activityName: string,
): string | null {
  const target = normalizeGameTitle(activityName);
  if (!target) return null;

  const normalized = games.map((g) => ({
    id: g.id,
    title: normalizeGameTitle(g.title),
  }));

  const exact = normalized.find((g) => g.title === target);
  if (exact) return exact.id;

  const prefix = normalized.find(
    (g) =>
      g.title.length > 0 &&
      (target.startsWith(g.title) || g.title.startsWith(target)),
  );
  return prefix?.id ?? null;
}

/**
 * Latest session per distinct game, ordered most-recent first.
 * Input is expected ordered by last_seen_at desc (DB order).
 */
export function dedupeSessionsByGame<T extends PlaySessionState>(
  sessions: T[],
  limit = 5,
): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const session of sessions) {
    const key = normalizeGameTitle(session.game_name);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(session);
    if (result.length >= limit) break;
  }
  return result;
}
