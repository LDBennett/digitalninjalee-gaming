import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/src/lib/infrastructure/supabase/supabaseClient";
import {
  fetchDiscordPresence,
  fetchSteamPresence,
} from "@/src/lib/backend/sync";
import { createSupabasePlaySessionRepository } from "@/src/lib/backend/activity/infrastructure";
import { recordPlaySighting } from "@/src/lib/backend/activity/application";
import { collectDistinctGameNames } from "@/src/lib/backend/activity/domain/services";

interface SourceResult {
  source: string;
  gameName: string | null;
  error?: string;
}

// Each source activates only when its env vars are set. Discord is listed
// first so its spelling wins the distinct-name dedupe — existing history
// rows are Discord-named, which keeps session continuity.
function pollConfiguredSources(): Array<Promise<SourceResult>> {
  const polls: Array<Promise<SourceResult>> = [];

  const botToken = process.env.DISCORD_BOT_TOKEN;
  const discordUserId = process.env.DISCORD_USER_ID;
  if (botToken && discordUserId) {
    polls.push(
      fetchDiscordPresence(
        botToken,
        discordUserId,
        process.env.DISCORD_GUILD_ID,
      ).then((r) =>
        r.success
          ? { source: "discord", gameName: r.value.gameName }
          : { source: "discord", gameName: null, error: r.error.message },
      ),
    );
  }

  const steamKey = process.env.STEAM_API_KEY;
  const steamId = process.env.STEAM_USER_ID;
  if (steamKey && steamId) {
    polls.push(
      fetchSteamPresence(steamKey, steamId).then((r) =>
        r.success
          ? { source: "steam", gameName: r.value.gameName }
          : { source: "steam", gameName: null, error: r.error.message },
      ),
    );
  }

  return polls;
}

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[activity-poll] CRON_SECRET is not configured");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }
  if (req.headers.get("Authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const polls = pollConfiguredSources();
  if (polls.length === 0) {
    console.error("[activity-poll] No presence source configured");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  try {
    const sources = await Promise.all(polls);
    const errors = sources
      .filter((s) => s.error)
      .map((s) => `${s.source}: ${s.error}`);
    if (errors.length > 0) console.error("[activity-poll]", errors.join("; "));

    // Every source failing is a poll failure, not "not playing".
    if (errors.length === sources.length) {
      return NextResponse.json({ error: errors.join("; ") }, { status: 502 });
    }

    const distinct = collectDistinctGameNames(sources);
    if (distinct.length === 0) {
      return NextResponse.json({
        playing: false,
        ...(errors.length > 0 && { errors }),
      });
    }

    const client = createServiceClient();
    const repo = createSupabasePlaySessionRepository(client);
    const now = new Date();

    const sightings: Array<{
      game: string;
      source: string;
      action: "extended" | "started";
      matched: boolean;
    }> = [];
    for (const { source, gameName } of distinct) {
      const recorded = await recordPlaySighting(client, repo, {
        gameName,
        // Steam presence is inherently PC; other sources have no reliable
        // platform signal yet (see docs/activity-tracking.md).
        platform: source === "steam" ? "pc" : undefined,
        now,
      });
      if (!recorded.success) {
        return NextResponse.json(
          { error: recorded.error.message },
          { status: 500 },
        );
      }
      sightings.push({
        game: gameName,
        source,
        action: recorded.value.action,
        matched: recorded.value.gameId !== null,
      });
    }

    return NextResponse.json({
      playing: true,
      sightings,
      ...(errors.length > 0 && { errors }),
    });
  } catch (e) {
    console.error("[activity-poll] Uncaught error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
