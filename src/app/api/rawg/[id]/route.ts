import { NextRequest, NextResponse } from "next/server";
import { fetchRawgGameData, mapRawgToMoods } from "@/src/lib/backend/sync";
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

  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey)
    return NextResponse.json(
      { error: "RAWG_API_KEY is not configured" },
      { status: 500 },
    );

  try {
    const data = await fetchRawgGameData(numericId, apiKey);
    return NextResponse.json(
      data ? { ...data, suggestedMoods: mapRawgToMoods(data) } : null,
    );
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
