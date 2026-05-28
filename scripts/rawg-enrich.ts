/**
 * RAWG Enrichment Script
 *
 * Fills background_url and suggests moods for games not yet synced with RAWG.
 * Uses game_external_ids (source='rawg') as the sync state — games with an
 * existing 'ok' row are skipped; games with no row or a 'failed' row are processed.
 *
 * Each game makes 2 RAWG API calls: one search by title, one detail fetch by ID.
 *
 * Required env vars (add to .env.local):
 *   SUPABASE_SERVICE_ROLE_KEY   — bypasses RLS for write access
 *   RAWG_API_KEY                — from https://rawg.io/apidocs
 *
 * Run:
 *   pnpm enrich:rawg
 */

import { createClient } from "@supabase/supabase-js";
import {
  createRawgClient,
  mapRawgToMoods,
} from "../src/infrastructure/platform-apis/rawg";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RAWG_API_KEY = process.env.RAWG_API_KEY;

// RAWG free tier: 20 req/sec. Each game uses 2 calls (search + detail).
const DELAY_MS = 120;

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function validateEnv(): void {
  const missing = (
    [
      ["NEXT_PUBLIC_SUPABASE_URL", SUPABASE_URL],
      ["SUPABASE_SERVICE_ROLE_KEY", SUPABASE_SERVICE_KEY],
      ["RAWG_API_KEY", RAWG_API_KEY],
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
  const rawg = createRawgClient(RAWG_API_KEY!);

  console.log("Connected to RAWG.\n");

  // Fetch games with no RAWG row yet, or with a failed previous attempt
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
    .range(999, 1500); // safety limit to prevent runaway script

  console.log(games?.length, "games fetched from Supabase");

  if (gamesError)
    throw new Error(`Failed to fetch games: ${gamesError.message}`);

  const toProcess = (games ?? []).filter((g: Record<string, unknown>) => {
    const extIds = g.game_external_ids as Array<{
      source: string;
      sync_status: string;
    }> | null;
    const rawgRow = extIds?.find((e) => e.source === "rawg");
    return !rawgRow || rawgRow.sync_status === "failed";
  });

  if (!toProcess.length) {
    console.log("All games are already synced with RAWG.");
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
        source: "rawg",
        external_id: "",
        sync_status: "pending",
      },
      { onConflict: "game_id,source" },
    );

    try {
      const cleanedTitle = (game.title as string)
        .replace(/\s*\(.*?\)\s*$/, "")
        .trim();
      const results = await rawg.searchGames(cleanedTitle);

      if (!results.length) {
        await supabase.from("game_external_ids").upsert(
          {
            game_id: game.id,
            source: "rawg",
            external_id: "",
            sync_status: "failed",
            last_synced_at: new Date().toISOString(),
          },
          { onConflict: "game_id,source" },
        );
        console.log(`  [skip]  "${game.title}" — not found on RAWG`);
        notFound++;
        continue;
      }

      await sleep(DELAY_MS);
      const detail = await rawg.fetchGame(results[0].id);

      if (!detail) {
        await supabase.from("game_external_ids").upsert(
          {
            game_id: game.id,
            source: "rawg",
            external_id: String(results[0].id),
            sync_status: "failed",
            last_synced_at: new Date().toISOString(),
          },
          { onConflict: "game_id,source" },
        );
        console.log(`  [skip]  "${game.title}" — detail fetch returned null`);
        notFound++;
        continue;
      }

      // Update background_url on the game row
      const { error: updateError } = await supabase
        .from("games")
        .update({ background_url: detail.backgroundUrl })
        .eq("id", game.id);
      if (updateError) throw new Error(updateError.message);

      // Suggest moods and upsert (existing moods are preserved)
      const suggestedMoodNames = mapRawgToMoods(detail);
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
          source: "rawg",
          external_id: String(detail.rawgId),
          sync_status: "ok",
          last_synced_at: new Date().toISOString(),
        },
        { onConflict: "game_id,source" },
      );

      const parts = [
        `background=${detail.backgroundUrl ? "yes" : "no"}`,
        `moods=[${suggestedMoodNames.join(", ") || "none"}]`,
      ];
      console.log(`  [ok]    "${game.title}" — ${parts.join(" | ")}`);
      enriched++;
    } catch (err) {
      await supabase.from("game_external_ids").upsert(
        {
          game_id: game.id,
          source: "rawg",
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
