import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/infrastructure/database/auth.server';
import { createSupabaseGameRepository } from '@/src/infrastructure/database/game.repo';
import { createSupabaseMoodRepository } from '@/src/infrastructure/database/mood.repo';
import { transitionGame, updateGameDetails, adjustPriority, replaceMoods, setReplayStatus } from '@/src/domains/games/services/game.service';
import { gameStateToDto, createPlatform, createGameStatus, createPriorityScore } from '@/src/domains/games/models/game.types';
import { GameState } from '@/src/domains/games/models/game.types';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const repo = createSupabaseGameRepository(auth.client);
  const result = await repo.findById(id);
  if (!result.success) return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  return NextResponse.json(gameStateToDto(result.value));
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await req.json();
  const gameRepo = createSupabaseGameRepository(auth.client);
  const moodRepo = createSupabaseMoodRepository(auth.client);

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
    body.background_url !== undefined ||
    body.cover_art_url !== undefined ||
    body.game_description !== undefined ||
    body.personal_note !== undefined ||
    body.rating !== undefined
  ) {
    const platformResult = createPlatform(body.platform ?? game.platform);
    if (!platformResult.success) return NextResponse.json({ error: platformResult.error }, { status: 400 });
    const detailsResult = updateGameDetails(
      game,
      body.title ?? game.title,
      platformResult.value,
      body.background_url !== undefined ? body.background_url : game.backgroundUrl,
      body.cover_art_url !== undefined ? body.cover_art_url : undefined,
      body.game_description !== undefined ? body.game_description : undefined,
      body.personal_note !== undefined ? body.personal_note : undefined,
      body.rating !== undefined ? body.rating : undefined,
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

  // Update external IDs if provided
  const externalIdRows: Array<{ game_id: string; source: string; external_id: string }> = [];
  if (body.rawg_id) externalIdRows.push({ game_id: id, source: 'rawg', external_id: String(body.rawg_id) });
  if (body.igdb_id) externalIdRows.push({ game_id: id, source: 'igdb', external_id: String(body.igdb_id) });
  if (externalIdRows.length > 0) {
    await auth.client.from('game_external_ids').upsert(externalIdRows, { ignoreDuplicates: false });
  }

  return NextResponse.json(gameStateToDto(game));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const repo = createSupabaseGameRepository(auth.client);
  const result = await repo.delete(id);
  if (!result.success) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
