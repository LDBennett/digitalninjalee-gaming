import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/src/infrastructure/database/supabase.client';
import { createSupabaseGameRepository } from '@/src/infrastructure/database/game.repo';
import { selectRandomGame } from '@/src/domains/games/services/game.service';
import { gameStateToDto } from '@/src/domains/games/models/game.types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const moodNames = searchParams.get('moods')?.split(',').filter(Boolean) ?? [];
  const status = searchParams.get('status') ?? 'backlog';

  const repo = createSupabaseGameRepository(createServerClient());
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
