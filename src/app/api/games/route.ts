import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/src/infrastructure/database/supabase.client';
import { createSupabaseGameRepository } from '@/src/infrastructure/database/game.repo';
import { createSupabaseMoodRepository } from '@/src/infrastructure/database/mood.repo';
import { newGame } from '@/src/domains/games/services/game.service';
import { gameStateToDto, createPlatform, createGameStatus, createPriorityScore, DEFAULT_PRIORITY_SCORE } from '@/src/domains/games/models/game.types';

function getToken(req: NextRequest): string | null {
  return req.headers.get('Authorization')?.replace('Bearer ', '') ?? null;
}

export async function GET(req: NextRequest) {
  const statusParam = new URL(req.url).searchParams.get('status') ?? undefined;
  const client = createServerClient();
  const repo = createSupabaseGameRepository(client);

  const filter = statusParam
    ? { status: statusParam.includes(',') ? statusParam.split(',') : statusParam }
    : undefined;

  const result = await repo.findAll(filter);
  if (!result.success) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json(result.value.map(gameStateToDto));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const client = createServerClient(getToken(req));
  const gameRepo = createSupabaseGameRepository(client);
  const moodRepo = createSupabaseMoodRepository(client);

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
    externalId: body.external_id ?? null,
    platform: platformResult.value,
    status: statusResult.value,
    priorityScore: scoreResult.value,
    coverUrl: body.cover_url ?? null,
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

  return NextResponse.json(gameStateToDto(gameResult.value), { status: 201 });
}
