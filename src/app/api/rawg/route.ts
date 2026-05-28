import { NextRequest, NextResponse } from 'next/server';
import { searchRawgGames } from '@/src/infrastructure/platform-apis/rawg';
import { requireAuth } from '@/src/infrastructure/database/auth.server';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const query = new URL(req.url).searchParams.get('q') ?? '';
  if (query.trim().length < 2) return NextResponse.json([]);

  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'RAWG_API_KEY is not configured' }, { status: 500 });

  try {
    const games = await searchRawgGames(query, apiKey);
    return NextResponse.json(games);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
