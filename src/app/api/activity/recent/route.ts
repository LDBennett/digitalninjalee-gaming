import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/src/lib/infrastructure/supabase/supabaseClient";
import { createSupabasePlaySessionRepository } from "@/src/lib/backend/activity/infrastructure";
import { dedupeSessionsByGame } from "@/src/lib/backend/activity/domain/services";

const FETCH_WINDOW = 150;
const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 50;

export async function GET(request: NextRequest) {
  try {
    const requestedLimit = Number(request.nextUrl.searchParams.get("limit"));
    const limit =
      Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, MAX_LIMIT)
        : DEFAULT_LIMIT;

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

    return NextResponse.json(dedupeSessionsByGame(recent.value, limit));
  } catch (e) {
    console.error("[activity/recent] Uncaught error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
