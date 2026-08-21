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

// Words that mark a title's remainder as an edition/version suffix rather
// than a genuinely different game (e.g. a subtitle or spin-off). Prefix
// matching only applies when the leftover words are drawn from this list —
// otherwise "Gears of War: E-Day" would wrongly match "Gears of War".
const EDITION_SUFFIX_WORDS = [
  "edition",
  "goty",
  "definitive",
  "deluxe",
  "complete",
  "enhanced",
  "remastered",
  "remaster",
  "royal",
  "gold",
  "ultimate",
  "extended",
  "anniversary",
  "directors",
  "cut",
  "special",
  "hd",
  "collection",
];

function isEditionSuffix(words: string[]): boolean {
  return (
    words.length > 0 &&
    words.every((w) => EDITION_SUFFIX_WORDS.includes(w))
  );
}

// Returns the leftover words of `longerWords` after `shorterWords`, only if
// `shorterWords` is a whole-word prefix of it; null otherwise.
function wordPrefixRemainder(
  longerWords: string[],
  shorterWords: string[],
): string[] | null {
  if (shorterWords.length === 0 || shorterWords.length > longerWords.length)
    return null;
  for (let i = 0; i < shorterWords.length; i++) {
    if (longerWords[i] !== shorterWords[i]) return null;
  }
  return longerWords.slice(shorterWords.length);
}

/**
 * Matches a Discord activity name against library titles. Exact normalized
 * match wins; otherwise a whole-word prefix match in either direction, but
 * only when the leftover words are edition/version vocabulary (handles
 * suffixes like "Game — Deluxe Edition") — a genuinely different title that
 * happens to share a word prefix (e.g. a spin-off subtitle) is rejected.
 * Returns the matched game id.
 */
export function matchGameByTitle(
  games: Array<{ id: string; title: string }>,
  activityName: string,
): string | null {
  const target = normalizeGameTitle(activityName);
  if (!target) return null;
  const targetWords = target.split(" ");

  const normalized = games.map((g) => ({
    id: g.id,
    title: normalizeGameTitle(g.title),
  }));

  const exact = normalized.find((g) => g.title === target);
  if (exact) return exact.id;

  const prefix = normalized.find((g) => {
    if (g.title.length === 0) return false;
    const gameWords = g.title.split(" ");
    const remainder =
      wordPrefixRemainder(targetWords, gameWords) ??
      wordPrefixRemainder(gameWords, targetWords);
    return remainder !== null && isEditionSuffix(remainder);
  });
  return prefix?.id ?? null;
}

/**
 * Distinct game names across presence sources, deduped by normalized title
 * (sources can disagree on ™/edition spelling for the same game). Earlier
 * sources win the spelling, so callers list Discord first to keep continuity
 * with existing history rows. Null (not playing) sightings are dropped.
 */
export function collectDistinctGameNames(
  sightings: Array<{ source: string; gameName: string | null }>,
): Array<{ source: string; gameName: string }> {
  const seen = new Set<string>();
  const result: Array<{ source: string; gameName: string }> = [];
  for (const { source, gameName } of sightings) {
    if (!gameName) continue;
    const key = normalizeGameTitle(gameName);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push({ source, gameName });
  }
  return result;
}

/**
 * Finds an open session for the same game under normalized-title comparison —
 * covers one source reporting a variant spelling of another source's game
 * ("ELDEN RING™" vs "ELDEN RING") within the merge gap, so alternating
 * sources extend one session instead of starting duplicates.
 */
export function findExtendableSession<T extends PlaySessionState>(
  sessions: T[],
  gameName: string,
  now: Date,
  gapMinutes: number = SESSION_MERGE_GAP_MINUTES,
): T | null {
  const target = normalizeGameTitle(gameName);
  if (!target) return null;
  return (
    sessions.find(
      (s) =>
        normalizeGameTitle(s.game_name) === target &&
        shouldExtendSession(s.last_seen_at, now, gapMinutes),
    ) ?? null
  );
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
