import { SupabaseClient } from "@supabase/supabase-js";
import { Result, ok, err } from "@/src/lib/backend/shared/result";
import type {
  PlaySessionState,
  RecentPlayDto,
} from "../domain/models/session.types";
import type {
  NewPlaySession,
  PlaySessionRepository,
} from "../repository/playSession.repo";

const SESSION_SELECT =
  "id, game_name, game_id, platform, started_at, last_seen_at";
const RECENT_SELECT = `${SESSION_SELECT}, game:games ( title, cover_art_url, platform )`;

export function createSupabasePlaySessionRepository(
  client: SupabaseClient,
): PlaySessionRepository {
  return {
    async findLatestByGameName(
      gameName: string,
    ): Promise<Result<PlaySessionState | null, Error>> {
      const { data, error } = await client
        .from("play_sessions")
        .select(SESSION_SELECT)
        .eq("game_name", gameName)
        .order("last_seen_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) return err(new Error(error.message));
      return ok((data as PlaySessionState | null) ?? null);
    },

    async findRecent(limit: number): Promise<Result<RecentPlayDto[], Error>> {
      const { data, error } = await client
        .from("play_sessions")
        .select(RECENT_SELECT)
        .order("last_seen_at", { ascending: false })
        .limit(limit);

      if (error) return err(new Error(error.message));
      return ok((data ?? []) as unknown as RecentPlayDto[]);
    },

    async insert(session: NewPlaySession): Promise<Result<void, Error>> {
      const { error } = await client.from("play_sessions").insert(session);
      if (error) return err(new Error(error.message));
      return ok(undefined);
    },

    async touch(id: string, lastSeenAt: string): Promise<Result<void, Error>> {
      const { error } = await client
        .from("play_sessions")
        .update({ last_seen_at: lastSeenAt })
        .eq("id", id);
      if (error) return err(new Error(error.message));
      return ok(undefined);
    },
  };
}
