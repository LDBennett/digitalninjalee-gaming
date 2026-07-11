import { NextResponse } from "next/server";
import { createServerClient } from "@/src/lib/infrastructure/supabase/supabaseClient";
import { createSupabasePlaySessionRepository } from "@/src/lib/backend/activity/infrastructure";
import { dedupeSessionsByGame } from "@/src/lib/backend/activity/domain/services";

const FETCH_WINDOW = 30;
const DISTINCT_GAMES = 5;

export async function GET() {
  try {
    const client = createServerClient(null);
    const repo = createSupabasePlaySessionRepository(client);

    const recent = await repo.findRecent(FETCH_WINDOW);
    if (!recent.success) {
      console.error("[activity/recent] Supabase error:", recent.error);
      return NextResponse.json(
        { error: recent.error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      dedupeSessionsByGame(recent.value, DISTINCT_GAMES),
    );
  } catch (e) {
    console.error("[activity/recent] Uncaught error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
