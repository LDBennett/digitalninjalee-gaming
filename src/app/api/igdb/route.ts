import { NextRequest, NextResponse } from "next/server";
import { createIgdbClient } from "@/src/infrastructure/platform-apis/igdb";

export async function GET(req: NextRequest) {
  const query = new URL(req.url).searchParams.get("q") ?? "";
  if (query.trim().length < 2) return NextResponse.json(null);

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
    const data = await client.fetchGame(query.trim());
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
