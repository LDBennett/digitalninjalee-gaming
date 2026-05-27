import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/src/infrastructure/database/supabase.client';
import { createSupabaseGameRepository } from '@/src/infrastructure/database/game.repo';
import { createSupabaseMoodRepository } from '@/src/infrastructure/database/mood.repo';
import { transitionGame, updateGameDetails, adjustPriority, replaceMoods, setReplayStatus } from '@/src/domains/games/services/game.service';
import { gameStateToDto, createPlatform, createGameStatus, createPriorityScore } from '@/src/domains/games/models/game.types';
import { GameState } from '@/src/domains/games/models/game.types';

function getToken(req: NextRequest): string | null {
  return req.headers.get('Authorization')?.replace('Bearer ', '') ?? null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const repo = createSupabaseGameRepository(createServerClient());
  const result = await repo.findById(id);
  if (!result.success) return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  return NextResponse.json(gameStateToDto(result.value));
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const client = createServerClient(getToken(req));
  const gameRepo = createSupabaseGameRepository(client);
  const moodRepo = createSupabaseMoodRepository(client);

  const findResult = await gameRepo.findById(id);
  if (!findResult.success) return NextResponse.json({ error: 'Game not found' }, { status: 404 });

  let game: GameState = findResult.value;

  if (body.status !== undefined && body.status !== game.status) {
    const statusResult = createGameStatus(body.status);
    if (!statusResult.success) return NextResponse.json({ error: statusResult.error }, { status: 400 });
    const transitionResult = transitionGame(game, statusResult.value);
    if (!transitionResult.success) return NextResponse.json({ error: transitionResult.error }, { status: 400 });
    game = transitionResult.value;
  }

  if (
    body.title !== undefined ||
    body.platform !== undefined ||
    body.cover_url !== undefined ||
    body.cover_art_url !== undefined ||
    body.game_description !== undefined
  ) {
    const platformResult = createPlatform(body.platform ?? game.platform);
    if (!platformResult.success) return NextResponse.json({ error: platformResult.error }, { status: 400 });
    const detailsResult = updateGameDetails(
      game,
      body.title ?? game.title,
      platformResult.value,
      body.cover_url !== undefined ? body.cover_url : game.coverUrl,
      body.cover_art_url !== undefined ? body.cover_art_url : undefined,
      body.game_description !== undefined ? body.game_description : undefined,
    );
    if (!detailsResult.success) return NextResponse.json({ error: detailsResult.error }, { status: 400 });
    game = detailsResult.value;
  }

  if (body.priority_score !== undefined) {
    const scoreResult = createPriorityScore(body.priority_score);
    if (!scoreResult.success) return NextResponse.json({ error: scoreResult.error }, { status: 400 });
    game = adjustPriority(game, scoreResult.value - game.priorityScore);
  }

  if (body.mood_ids !== undefined) {
    const moodsResult = await moodRepo.findByIds(body.mood_ids);
    if (!moodsResult.success) return NextResponse.json({ error: moodsResult.error.message }, { status: 500 });
    game = replaceMoods(game, moodsResult.value);
  }

  if (body.replay_status !== undefined) {
    game = setReplayStatus(game, body.replay_status ?? null);
  }

  const updateResult = await gameRepo.update(game);
  if (!updateResult.success) return NextResponse.json({ error: updateResult.error.message }, { status: 500 });

  return NextResponse.json(gameStateToDto(game));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const repo = createSupabaseGameRepository(createServerClient(getToken(req)));
  const result = await repo.delete(id);
  if (!result.success) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
