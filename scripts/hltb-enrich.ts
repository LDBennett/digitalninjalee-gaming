/**
 * HowLongToBeat Enrichment Script
 *
 * Backfills time_to_beat for games where it is currently NULL.
 * Uses native fetchHltbPlaytimes adapter with polite throttling (~1.2s delay).
 *
 * Usage:
 *   pnpm enrich:hltb
 *   pnpm enrich:hltb --status=playing,backlog
 *   pnpm enrich:hltb --limit=50
 */

import { createClient } from "@supabase/supabase-js";
import { fetchHltbPlaytimes } from "../src/lib/backend/sync/hltb.adapter";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Throttling: 1.2 seconds between requests to avoid rate-limiting
const DELAY_MS = 1200;

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function parseCliArgs() {
  const args = process.argv.slice(2);
  let statuses: string[] | null = null;
  let limit: number | null = null;

  for (const arg of args) {
    if (arg.startsWith("--status=")) {
      statuses = arg.slice("--status=".length).split(",").map((s) => s.trim()).filter(Boolean);
    } else if (arg.startsWith("--limit=")) {
      limit = parseInt(arg.slice("--limit=".length), 10);
    }
  }

  return { statuses, limit };
}

function validateEnv(): void {
  const missing = (
    [
      ["NEXT_PUBLIC_SUPABASE_URL", SUPABASE_URL],
      ["SUPABASE_SERVICE_ROLE_KEY", SUPABASE_SERVICE_KEY],
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
  const { statuses, limit } = parseCliArgs();

  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

  console.log("🎮 HowLongToBeat Backfill Initializing...\n");
  if (statuses) {
    console.log(`Filtering by status: [${statuses.join(", ")}]`);
  }
  if (limit) {
    console.log(`Limit: ${limit} games`);
  }

  let query = supabase
    .from("games")
    .select("id, title, status, platform")
    .is("time_to_beat", null)
    .order("priority_score", { ascending: false });

  if (statuses && statuses.length > 0) {
    query = query.in("status", statuses);
  }
  if (limit && limit > 0) {
    query = query.limit(limit);
  }

  const { data: games, error } = await query;
  if (error) {
    console.error("Failed to query games:", error.message);
    process.exit(1);
  }

  if (!games || games.length === 0) {
    console.log("✨ All matching games already have time_to_beat populated!");
    return;
  }

  console.log(`Found ${games.length} games to enrich.\n`);

  let succeeded = 0;
  let missed = 0;

  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    const prefix = `[${i + 1}/${games.length}]`;
    process.stdout.write(`${prefix} ${game.title} ... `);

    try {
      const result = await fetchHltbPlaytimes(game.title);

      if (result.success && result.value) {
        const ttb = result.value;
        const { error: updateError } = await supabase
          .from("games")
          .update({ time_to_beat: ttb })
          .eq("id", game.id);

        if (updateError) {
          console.log(`❌ DB update failed: ${updateError.message}`);
        } else {
          const mainStr = ttb.main !== null ? `${ttb.main}h` : "--";
          const compStr = ttb.completionist !== null ? `${ttb.completionist}h` : "--";
          console.log(`✓ Main: ${mainStr} | 100%: ${compStr}`);
          succeeded++;
        }
      } else {
        console.log(`⚠️ No match found on HLTB`);
        missed++;
      }
    } catch (err) {
      console.log(`❌ Error: ${err instanceof Error ? err.message : String(err)}`);
      missed++;
    }

    if (i < games.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n🎉 Backfill complete! Succeeded: ${succeeded}, Missed/Skipped: ${missed}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
