import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/src/lib/infrastructure/supabase/supabaseClient";

const ALLOWED_ORIGINS = new Set([
  "https://ldbennett.com",
  "https://www.ldbennett.com",
  ...(process.env.NODE_ENV === "development" ? ["http://localhost:4321", "http://localhost:3000"] : []),
]);

function corsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
  if (ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

export async function GET(req: NextRequest) {
  const client = createServiceClient();

  const { data, error } = await client
    .from("games")
    .select("id, title, platform, status, cover_art_url, background_url, rating, priority_score")
    .or("status.in.(playing,ongoing),replay_status.eq.replaying")
    .order("priority_score", { ascending: false })
    .limit(5);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders(req) });
  }

  return NextResponse.json({ games: data ?? [] }, { headers: corsHeaders(req) });
}
