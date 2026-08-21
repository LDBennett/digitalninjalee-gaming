import { NextRequest, NextResponse } from "next/server";
import { createPlatform, type Platform } from "@/src/lib/backend/backlog/domain/models";
import { requireAuth } from "@/src/lib/backend/backlog/infrastructure";
import { createServiceClient } from "@/src/lib/infrastructure/supabase/supabaseClient";
import { createSupabasePlaySessionRepository } from "@/src/lib/backend/activity/infrastructure";
import { recordPlaySighting } from "@/src/lib/backend/activity/application";

/**
 * Manually logs a play sighting — the entry point for platforms no presence
 * source can see (Switch, retro consoles). Runs through the same session
 * merge logic as the cron poll.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const gameName =
    typeof body?.game_name === "string" ? body.game_name.trim() : "";
  if (!gameName) {
    return NextResponse.json(
      { error: "game_name is required" },
      { status: 400 },
    );
  }
  const knownGameId =
    typeof body?.game_id === "string" ? body.game_id : undefined;

  let platform: Platform | undefined;
  if (typeof body?.platform === "string" && body.platform.length > 0) {
    const parsed = createPlatform(body.platform);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    platform = parsed.value;
  }

  // play_sessions RLS only grants writes to service_role; requireAuth above
  // is the actual gate.
  const client = createServiceClient();
  const repo = createSupabasePlaySessionRepository(client);

  const recorded = await recordPlaySighting(client, repo, {
    gameName,
    knownGameId,
    platform,
    now: new Date(),
  });
  if (!recorded.success) {
    return NextResponse.json(
      { error: recorded.error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    game: gameName,
    action: recorded.value.action,
    matched: recorded.value.gameId !== null,
  });
}
