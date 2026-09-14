import { NextRequest, NextResponse } from "next/server";
import { fetchHltbPlaytimes } from "@/src/lib/backend/sync";
import { optionalAuth } from "@/src/lib/backend/backlog/infrastructure";

export async function GET(req: NextRequest) {
  // Read route with optional auth
  await optionalAuth(req);

  const query = new URL(req.url).searchParams.get("title") ?? "";
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return NextResponse.json({ time_to_beat: null });
  }

  const result = await fetchHltbPlaytimes(trimmed);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message, time_to_beat: null },
      { status: 502 },
    );
  }

  return NextResponse.json({ time_to_beat: result.value });
}
