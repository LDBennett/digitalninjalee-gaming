/**
 * IGDB Enrichment Script
 *
 * Fills cover_art_url, game_description, and suggests moods for any game
 * in the database that is missing those fields.
 *
 * Required env vars (add to .env.local):
 *   SUPABASE_SERVICE_ROLE_KEY   — bypasses RLS for write access
 *   IGDB_CLIENT_ID              — from https://dev.twitch.tv/console/apps
 *   IGDB_CLIENT_SECRET          — from the same Twitch app
 *
 * Run:
 *   pnpm enrich
 */

import { createClient } from "@supabase/supabase-js";
import {
  createIgdbClient,
  mapIgdbToMoods,
} from "../src/infrastructure/platform-apis/igdb";

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

  // Fetch games where either enrichment field is still null
  const { data: games, error: gamesError } = await supabase
    .from("games")
    .select("id, title")
    .or("cover_art_url.is.null,game_description.is.null")
    .order("title");

  if (gamesError)
    throw new Error(`Failed to fetch games: ${gamesError.message}`);
  if (!games?.length) {
    console.log("All games are already enriched.");
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

  console.log(`Enriching ${games.length} game(s)...\n`);

  let enriched = 0;
  let notFound = 0;
  let failed = 0;

  for (const game of games) {
    await sleep(DELAY_MS);

    try {
      // Remove any platform suffixes in the title (e.g. "Game Title (PC)") to improve IGDB matching
      const cleanedTitle = game.title.replace(/\s*\(.*?\)\s*$/, "").trim();
      const igdbData = await igdb.fetchGame(cleanedTitle);

      if (!igdbData) {
        console.log(`  [skip]  "${game.title}" — not found on IGDB`);
        notFound++;
        continue;
      }

      // Update the two new columns
      const { error: updateError } = await supabase
        .from("games")
        .update({
          cover_art_url: igdbData.coverArtUrl,
          game_description: igdbData.summary,
        })
        .eq("id", game.id);

      if (updateError) throw new Error(updateError.message);

      // Suggest moods and upsert into game_moods (existing moods are preserved)
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

      const parts = [
        `cover=${igdbData.coverArtUrl ? "yes" : "no"}`,
        `summary=${igdbData.summary ? "yes" : "no"}`,
        `moods=[${suggestedMoodNames.join(", ") || "none"}]`,
      ];
      console.log(`  [ok]    "${game.title}" — ${parts.join(" | ")}`);
      enriched++;
    } catch (err) {
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
