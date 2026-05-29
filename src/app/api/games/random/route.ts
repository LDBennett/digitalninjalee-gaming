import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, createSupabaseGameRepository } from '@/src/lib/backend/backlog/infrastructure';
import { selectRandomGame } from '@/src/lib/backend/backlog/domain/services';
import { gameStateToDto } from '@/src/lib/backend/backlog/domain/models';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const moodNames = searchParams.get('moods')?.split(',').filter(Boolean) ?? [];
  const status = searchParams.get('status')?.split(',').filter(Boolean) ?? ['backlog'];

  const repo = createSupabaseGameRepository(auth.client);
  const result = await repo.findAll({ status });
  if (!result.success) return NextResponse.json({ error: result.error.message }, { status: 500 });

  let games = result.value;
  if (!games.length) return NextResponse.json({ game: null, message: 'No games found' });

  if (moodNames.length > 0) {
    games = games.filter((g) => moodNames.some((name) => g.moods.some((m) => m.name === name)));
  }

  if (!games.length) return NextResponse.json({ game: null, message: 'No games match those moods' });

  const picked = selectRandomGame(games);
  return NextResponse.json({ game: picked ? gameStateToDto(picked) : null });
}
