import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/infrastructure/database/auth.server';
import { createSupabaseGameRepository } from '@/src/infrastructure/database/game.repo';
import { createSupabaseMoodRepository } from '@/src/infrastructure/database/mood.repo';
import { newGame } from '@/src/domains/games/services/game.service';
import { gameStateToDto, createPlatform, createGameStatus, createPriorityScore, DEFAULT_PRIORITY_SCORE } from '@/src/domains/games/models/game.types';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const statusParam = new URL(req.url).searchParams.get('status') ?? undefined;
  const repo = createSupabaseGameRepository(auth.client);

  const filter = statusParam
    ? { status: statusParam.includes(',') ? statusParam.split(',') : statusParam }
    : undefined;

  const result = await repo.findAll(filter);
  if (!result.success) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json(result.value.map(gameStateToDto));
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const gameRepo = createSupabaseGameRepository(auth.client);
  const moodRepo = createSupabaseMoodRepository(auth.client);

  const platformResult = createPlatform(body.platform);
  if (!platformResult.success) return NextResponse.json({ error: platformResult.error }, { status: 400 });

  const statusResult = createGameStatus(body.status ?? 'backlog');
  if (!statusResult.success) return NextResponse.json({ error: statusResult.error }, { status: 400 });

  const scoreResult = createPriorityScore(body.priority_score ?? DEFAULT_PRIORITY_SCORE);
  if (!scoreResult.success) return NextResponse.json({ error: scoreResult.error }, { status: 400 });

  const moodsResult = await moodRepo.findByIds(body.mood_ids ?? []);
  if (!moodsResult.success) return NextResponse.json({ error: moodsResult.error.message }, { status: 500 });

  const gameResult = newGame({
    title: body.title,
    platform: platformResult.value,
    status: statusResult.value,
    priorityScore: scoreResult.value,
    backgroundUrl: body.background_url ?? null,
    coverArtUrl: body.cover_art_url ?? null,
    gameDescription: body.game_description ?? null,
    moods: moodsResult.value,
    replayStatus: body.replay_status ?? null,
    personalNote: body.personal_note ?? null,
    rating: body.rating ?? null,
  });
  if (!gameResult.success) return NextResponse.json({ error: gameResult.error }, { status: 400 });

  const saveResult = await gameRepo.save(gameResult.value);
  if (!saveResult.success) return NextResponse.json({ error: saveResult.error.message }, { status: 500 });

  // Write external IDs to game_external_ids if provided
  const externalIdRows: Array<{ game_id: string; source: string; external_id: string }> = [];
  if (body.rawg_id) externalIdRows.push({ game_id: gameResult.value.id, source: 'rawg', external_id: String(body.rawg_id) });
  if (body.igdb_id) externalIdRows.push({ game_id: gameResult.value.id, source: 'igdb', external_id: String(body.igdb_id) });
  if (externalIdRows.length > 0) {
    await auth.client.from('game_external_ids').upsert(externalIdRows, { ignoreDuplicates: false });
  }

  return NextResponse.json(gameStateToDto(gameResult.value), { status: 201 });
}
