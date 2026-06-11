import { NextRequest, NextResponse } from "next/server";
import { createIgdbClient, mapIgdbToMoods } from "@/src/lib/backend/sync";
import { requireAuth } from "@/src/lib/backend/backlog/infrastructure";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const numericId = Number(id);
  if (!numericId) return NextResponse.json(null, { status: 400 });

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
    const data = await client.fetchGame(numericId);
    return NextResponse.json(
      data ? { ...data, suggestedMoods: mapIgdbToMoods(data) } : null,
    );
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
