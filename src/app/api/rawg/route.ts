import { NextRequest, NextResponse } from 'next/server';
import { searchRawgGames } from '@/src/infrastructure/platform-apis/rawg';

export async function GET(req: NextRequest) {
  const query = new URL(req.url).searchParams.get('q') ?? '';
  if (query.trim().length < 2) return NextResponse.json([]);

  try {
    const games = await searchRawgGames(query);
    return NextResponse.json(games);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
