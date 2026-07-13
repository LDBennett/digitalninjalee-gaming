import { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/src/lib/infrastructure/supabase/supabaseClient";
import { fetchDiscordPresence } from "@/src/lib/backend/sync";
import { createSupabasePlaySessionRepository } from "@/src/lib/backend/activity/infrastructure";
import {
  matchGameByTitle,
  shouldExtendSession,
} from "@/src/lib/backend/activity/domain/services";

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

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[discord-poll] CRON_SECRET is not configured");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }
  if (req.headers.get("Authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const botToken = process.env.DISCORD_BOT_TOKEN;
  const userId = process.env.DISCORD_USER_ID;
  if (!botToken || !userId) {
    console.error("[discord-poll] Discord env vars missing");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  try {
    const presence = await fetchDiscordPresence(
      botToken,
      userId,
      process.env.DISCORD_GUILD_ID,
    );
    if (!presence.success) {
      console.error("[discord-poll] Presence fetch failed:", presence.error);
      return NextResponse.json(
        { error: presence.error.message },
        { status: 502 },
      );
    }

    const gameName = presence.value.gameName;
    if (!gameName) {
      return NextResponse.json({ playing: false });
    }

    const client = createServiceClient();
    const repo = createSupabasePlaySessionRepository(client);
    const now = new Date();
    const nowIso = now.toISOString();

    const latest = await repo.findLatestByGameName(gameName);
    if (!latest.success) {
      return NextResponse.json(
        { error: latest.error.message },
        { status: 500 },
      );
    }

    if (latest.value && shouldExtendSession(latest.value.last_seen_at, now)) {
      const touched = await repo.touch(latest.value.id, nowIso);
      if (!touched.success) {
        return NextResponse.json(
          { error: touched.error.message },
          { status: 500 },
        );
      }
      return NextResponse.json({
        playing: true,
        game: gameName,
        action: "extended",
      });
    }

    const { data: games, error: gamesError } = await fetchAllGameTitles(client);
    if (gamesError) {
      return NextResponse.json({ error: gamesError.message }, { status: 500 });
    }

    const gameId = matchGameByTitle(games ?? [], gameName);

    const inserted = await repo.insert({
      game_name: gameName,
      game_id: gameId,
      started_at: nowIso,
      last_seen_at: nowIso,
    });
    if (!inserted.success) {
      return NextResponse.json(
        { error: inserted.error.message },
        { status: 500 },
      );
    }

    if (gameId) {
      await client
        .from("games")
        .update({ last_played_at: nowIso })
        .eq("id", gameId);
    }

    return NextResponse.json({
      playing: true,
      game: gameName,
      action: "started",
      matched: gameId !== null,
    });
  } catch (e) {
    console.error("[discord-poll] Uncaught error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
