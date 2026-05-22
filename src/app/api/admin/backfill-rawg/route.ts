import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { searchRawgGames } from "@/src/infrastructure/platform-apis/rawg";

// Run locally only — never deploy this route to production.
// Trigger with: curl -X POST http://localhost:3000/api/admin/backfill-rawg

export async function POST() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY not set" },
      { status: 500 },
    );
  }

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
  );

  const { data: games, error } = await client
    .from("games")
    .select("id, title, cover_url")
    .is("external_id", null);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!games?.length)
    return NextResponse.json({
      message: "All games already have an external_id",
      total: 0,
    });

  const results: Array<{ title: string; status: string; matched?: string }> =
    [];
  console.log(results);

  for (const game of games) {
    try {
      const matches = await searchRawgGames(game.title);
      const best = matches[0];
      console.log(
        `Backfilling "${game.title}" - best match: "${best?.name}" (${best?.id})`,
      );
      if (!best) {
        results.push({ title: game.title, status: "no_match" });
        continue;
      }

      const updates: Record<string, unknown> = { external_id: String(best.id) };
      // Only set cover_url if the game doesn't already have one
      if (!game.cover_url && best.coverUrl) {
        updates.cover_url = best.coverUrl;
      }

      const { error: updateError } = await client
        .from("games")
        .update(updates)
        .eq("id", game.id);

      results.push({
        title: game.title,
        status: updateError ? `error: ${updateError.message}` : "updated",
        matched: best.name,
      });
    } catch (e) {
      results.push({
        title: game.title,
        status: `error: ${(e as Error).message}`,
      });
    }

    // Stay well within RAWG's 40 req/min free tier limit
    await new Promise((r) => setTimeout(r, 1500));
  }

  const updated = results.filter((r) => r.status === "updated").length;
  const noMatch = results.filter((r) => r.status === "no_match").length;
  const errors = results.filter((r) => r.status.startsWith("error")).length;

  return NextResponse.json({
    total: games.length,
    updated,
    no_match: noMatch,
    errors,
    results,
  });
}
