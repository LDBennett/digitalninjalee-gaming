import { SupabaseClient } from "@supabase/supabase-js";
import { Result, ok, err } from "@/src/lib/backend/shared/result";
import type { Platform } from "@/src/lib/backend/shared/platform";
import type { PlaySessionRepository } from "../repository/playSession.repo";
import type { PlaySessionState } from "../domain/models/session.types";
import {
  findExtendableSession,
  matchGameByTitle,
  shouldExtendSession,
} from "../domain/services";

export interface PlaySightingInput {
  gameName: string;
  /** Library game id when the caller already knows it (manual pick) — skips title matching. */
  knownGameId?: string;
  /** Platform the sighting is known to be on (e.g. a manual log entry). Auto-detected sources that can't tell leave this unset. */
  platform?: Platform;
  now: Date;
}

export interface PlaySightingResult {
  action: "extended" | "started";
  gameId: string | null;
}

// How many recent sessions to scan for a variant-spelling match when the
// exact-name lookup misses (a different source may spell the same game
// differently). Only sessions inside the merge gap can match, so a small
// window is plenty.
const CONTINUITY_SCAN_LIMIT = 10;

// PostgREST caps unfiltered selects at 1000 rows; the library exceeds that,
// so page through like GameRepository.findAll does.
async function fetchAllGameTitles(client: SupabaseClient) {
  const PAGE_SIZE = 1000;
  const titles: Array<{ id: string; title: string }> = [];
  let from = 0;

  while (true) {
    const { data, error } = await client
      .from("games")
      .select("id, title")
      .range(from, from + PAGE_SIZE - 1);
    if (error) return { data: null, error };

    titles.push(...(data as Array<{ id: string; title: string }>));
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return { data: titles, error: null };
}

async function findOpenSession(
  repo: PlaySessionRepository,
  gameName: string,
  now: Date,
): Promise<Result<PlaySessionState | null, Error>> {
  const latest = await repo.findLatestByGameName(gameName);
  if (!latest.success) return latest;

  if (latest.value && shouldExtendSession(latest.value.last_seen_at, now)) {
    return ok(latest.value);
  }

  // A different source may have logged this game under a variant spelling.
  const recent = await repo.findRecent(CONTINUITY_SCAN_LIMIT);
  if (!recent.success) return err(recent.error);
  return ok(findExtendableSession(recent.value, gameName, now));
}

/**
 * Records one sighting of a game being played: extends the open session for
 * that game (exact name first, then normalized-title fallback across recent
 * sessions) or starts a new one, matching it to the library and bumping the
 * matched game's last_played_at.
 */
export async function recordPlaySighting(
  client: SupabaseClient,
  repo: PlaySessionRepository,
  { gameName, knownGameId, platform, now }: PlaySightingInput,
): Promise<Result<PlaySightingResult, Error>> {
  const nowIso = now.toISOString();

  const open = await findOpenSession(repo, gameName, now);
  if (!open.success) return open;

  if (open.value) {
    const touched = await repo.touch(open.value.id, nowIso);
    if (!touched.success) return touched;
    return ok({ action: "extended", gameId: open.value.game_id });
  }

  let gameId: string | null;
  if (knownGameId) {
    gameId = knownGameId;
  } else {
    const { data: games, error: gamesError } = await fetchAllGameTitles(client);
    if (gamesError) return err(new Error(gamesError.message));
    gameId = matchGameByTitle(games ?? [], gameName);
  }

  const inserted = await repo.insert({
    game_name: gameName,
    game_id: gameId,
    platform: platform ?? null,
    started_at: nowIso,
    last_seen_at: nowIso,
  });
  if (!inserted.success) return inserted;

  if (gameId) {
    await client
      .from("games")
      .update({ last_played_at: nowIso })
      .eq("id", gameId);
  }

  return ok({ action: "started", gameId });
}
