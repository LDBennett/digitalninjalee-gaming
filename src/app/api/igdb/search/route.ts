import { NextRequest, NextResponse } from "next/server";
import { createIgdbClient } from "@/src/lib/backend/sync";
import { requireAuth } from "@/src/lib/backend/backlog/infrastructure";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const query = new URL(req.url).searchParams.get("q") ?? "";
  if (query.trim().length < 2) return NextResponse.json([]);

  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "IGDB credentials not configured" },
      { status: 500 },
    );
  }

  try {
    const client = await createIgdbClient(clientId, clientSecret);
    const results = await client.searchGames(query.trim());
    return NextResponse.json(results);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
