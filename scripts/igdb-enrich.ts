/**
 * IGDB Enrichment Script
 *
 * Fills cover_art_url and game_description, and suggests moods for games not
 * yet synced with IGDB. Uses game_external_ids (source='igdb') as the sync
 * state — games with an existing 'ok' row are skipped; games with no row or a
 * 'failed' row are processed.
 *
 * Required env vars (add to .env.local):
 *   SUPABASE_SERVICE_ROLE_KEY   — bypasses RLS for write access
 *   IGDB_CLIENT_ID              — from https://dev.twitch.tv/console/apps
 *   IGDB_CLIENT_SECRET          — from the same Twitch app
 *
 * Run:
 *   pnpm enrich:igdb
 */

import { createClient } from "@supabase/supabase-js";
import {
  createIgdbClient,
  mapIgdbToMoods,
} from "../src/lib/backend/sync/igdb.adapter";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const IGDB_CLIENT_ID = process.env.IGDB_CLIENT_ID;
const IGDB_CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;

// IGDB free tier: 4 requests/second
const DELAY_MS = 260;

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function validateEnv(): void {
  const missing = (
    [
      ["NEXT_PUBLIC_SUPABASE_URL", SUPABASE_URL],
      ["SUPABASE_SERVICE_ROLE_KEY", SUPABASE_SERVICE_KEY],
      ["IGDB_CLIENT_ID", IGDB_CLIENT_ID],
      ["IGDB_CLIENT_SECRET", IGDB_CLIENT_SECRET],
    ] as [string, string | undefined][]
  )
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length) {
    throw new Error(`Missing required env vars:\n  ${missing.join("\n  ")}`);
  }
}

async function main() {
  validateEnv();

  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);
  const igdb = await createIgdbClient(IGDB_CLIENT_ID!, IGDB_CLIENT_SECRET!);

  console.log("Connected to IGDB.\n");

  // Fetch games with no IGDB row yet, or with a failed previous attempt
  const { data: games, error: gamesError } = await supabase
    .from("games")
    .select(
      `
      id,
      title,
      game_external_ids!left ( source, sync_status )
    `,
    )
    .order("title")
    .range(999, 1500); //;

  if (gamesError)
    throw new Error(`Failed to fetch games: ${gamesError.message}`);

  const toProcess = (games ?? []).filter((g: Record<string, unknown>) => {
    const extIds = g.game_external_ids as Array<{
      source: string;
      sync_status: string;
    }> | null;
    const igdbRow = extIds?.find((e) => e.source === "igdb");
    return !igdbRow || igdbRow.sync_status === "failed";
  });

  if (!toProcess.length) {
    console.log("All games are already synced with IGDB.");
    return;
  }

  // Build mood name → id lookup
  const { data: moodRows, error: moodsError } = await supabase
    .from("moods")
    .select("id, name");
  if (moodsError)
    throw new Error(`Failed to fetch moods: ${moodsError.message}`);
  const moodByName = new Map<string, string>(
    moodRows!.map((m) => [m.name as string, m.id as string]),
  );

  console.log(`Processing ${toProcess.length} game(s)...\n`);

  let enriched = 0;
  let notFound = 0;
  let failed = 0;

  for (const game of toProcess) {
    await sleep(DELAY_MS);

    // Mark as pending before the API call
    await supabase.from("game_external_ids").upsert(
      {
        game_id: game.id,
        source: "igdb",
        external_id: "",
        sync_status: "pending",
      },
      { onConflict: "game_id,source" },
    );

    try {
      const cleanedTitle = (game.title as string)
        .replace(/\s*\(.*?\)\s*$/, "")
        .trim();
      const igdbData = await igdb.fetchGame(cleanedTitle);

      if (!igdbData) {
        await supabase.from("game_external_ids").upsert(
          {
            game_id: game.id,
            source: "igdb",
            external_id: "",
            sync_status: "failed",
            last_synced_at: new Date().toISOString(),
          },
          { onConflict: "game_id,source" },
        );
        console.log(`  [skip]  "${game.title}" — not found on IGDB`);
        notFound++;
        continue;
      }

      // Update cover art and description on the game row
      const { error: updateError } = await supabase
        .from("games")
        .update({
          cover_art_url: igdbData.coverArtUrl,
          game_description: igdbData.summary,
        })
        .eq("id", game.id);
      if (updateError) throw new Error(updateError.message);

      // Suggest moods and upsert (existing moods are preserved)
      const suggestedMoodNames = mapIgdbToMoods(igdbData);
      const moodInserts = suggestedMoodNames
        .filter((name) => moodByName.has(name))
        .map((name) => ({ game_id: game.id, mood_id: moodByName.get(name)! }));

      if (moodInserts.length > 0) {
        const { error: moodInsertError } = await supabase
          .from("game_moods")
          .upsert(moodInserts, { ignoreDuplicates: true });
        if (moodInsertError) {
          console.warn(
            `    [warn] mood upsert for "${game.title}": ${moodInsertError.message}`,
          );
        }
      }

      // Mark sync as complete
      await supabase.from("game_external_ids").upsert(
        {
          game_id: game.id,
          source: "igdb",
          external_id: String(igdbData.igdbId),
          sync_status: "ok",
          last_synced_at: new Date().toISOString(),
        },
        { onConflict: "game_id,source" },
      );

      const parts = [
        `cover=${igdbData.coverArtUrl ? "yes" : "no"}`,
        `summary=${igdbData.summary ? "yes" : "no"}`,
        `moods=[${suggestedMoodNames.join(", ") || "none"}]`,
      ];
      console.log(`  [ok]    "${game.title}" — ${parts.join(" | ")}`);
      enriched++;
    } catch (err) {
      await supabase.from("game_external_ids").upsert(
        {
          game_id: game.id,
          source: "igdb",
          external_id: "",
          sync_status: "failed",
          last_synced_at: new Date().toISOString(),
        },
        { onConflict: "game_id,source" },
      );
      console.error(`  [fail]  "${game.title}" — ${(err as Error).message}`);
      failed++;
    }
  }

  console.log(`\n${"─".repeat(50)}`);
  console.log(
    `Enriched: ${enriched}  |  Not found: ${notFound}  |  Failed: ${failed}`,
  );
}

main().catch((err) => {
  console.error("\nFatal error:", err.message);
  process.exit(1);
});
