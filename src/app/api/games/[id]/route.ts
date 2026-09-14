import { NextRequest, NextResponse } from "next/server";
import {
  requireAuth,
  createSupabaseGameRepository,
  createSupabaseMoodRepository,
} from "@/src/lib/backend/backlog/infrastructure";
import {
  transitionGame,
  updateGameDetails,
  adjustPriority,
  replaceMoods,
  setReplayStatus,
  setPlayGoals,
} from "@/src/lib/backend/backlog/domain/services";
import {
  gameStateToDto,
  createPlatform,
  createGameStatus,
  createPriorityScore,
  createPlayGoals,
} from "@/src/lib/backend/backlog/domain/models";
import type {
  GameState,
  UpdateGameDto,
} from "@/src/lib/backend/backlog/domain/models";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const repo = createSupabaseGameRepository(auth.client);
  const result = await repo.findById(id);
  if (!result.success)
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  return NextResponse.json(gameStateToDto(result.value));
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body: UpdateGameDto = await req.json();
  const gameRepo = createSupabaseGameRepository(auth.client);
  const moodRepo = createSupabaseMoodRepository(auth.client);

  const findResult = await gameRepo.findById(id);
  if (!findResult.success)
    return NextResponse.json({ error: "Game not found" }, { status: 404 });

  let game: GameState = findResult.value;

  if (body.status !== undefined && body.status !== game.status) {
    const statusResult = createGameStatus(body.status);
    if (!statusResult.success)
      return NextResponse.json({ error: statusResult.error }, { status: 400 });
    const transitionResult = transitionGame(game, statusResult.value);
    if (!transitionResult.success)
      return NextResponse.json({ error: transitionResult.error }, { status: 400 });
    game = transitionResult.value;
  }

  if (
    body.title !== undefined ||
    body.platform !== undefined ||
    body.background_url !== undefined ||
    body.cover_art_url !== undefined ||
    body.game_description !== undefined ||
    body.personal_note !== undefined ||
    body.rating !== undefined ||
    body.time_to_beat !== undefined ||
    body.completion_roadmap !== undefined
  ) {
    const platformResult = createPlatform(body.platform ?? game.platform);
    if (!platformResult.success)
      return NextResponse.json({ error: platformResult.error }, { status: 400 });
    const detailsResult = updateGameDetails(
      game,
      body.title ?? game.title,
      platformResult.value,
      body.background_url !== undefined ? body.background_url : game.backgroundUrl,
      body.cover_art_url !== undefined ? body.cover_art_url : undefined,
      body.game_description !== undefined ? body.game_description : undefined,
      body.personal_note !== undefined ? body.personal_note : undefined,
      body.rating !== undefined ? body.rating : undefined,
      body.time_to_beat !== undefined ? body.time_to_beat : undefined,
      body.completion_roadmap !== undefined ? body.completion_roadmap : undefined,
    );
    if (!detailsResult.success)
      return NextResponse.json({ error: detailsResult.error }, { status: 400 });
    game = detailsResult.value;
  }

  if (body.priority_score !== undefined) {
    const scoreResult = createPriorityScore(body.priority_score);
    if (!scoreResult.success)
      return NextResponse.json({ error: scoreResult.error }, { status: 400 });
    game = adjustPriority(game, scoreResult.value - game.priorityScore);
  }

  if (body.mood_ids !== undefined) {
    const moodsResult = await moodRepo.findByIds(body.mood_ids);
    if (!moodsResult.success)
      return NextResponse.json({ error: moodsResult.error.message }, { status: 500 });
    game = replaceMoods(game, moodsResult.value);
  }

  if (body.replay_status !== undefined) {
    game = setReplayStatus(game, body.replay_status ?? null);
  }

  if (body.play_goals !== undefined) {
    const playGoalsResult = createPlayGoals(body.play_goals);
    if (!playGoalsResult.success)
      return NextResponse.json({ error: playGoalsResult.error }, { status: 400 });
    game = setPlayGoals(game, playGoalsResult.value);
  }

  const updateResult = await gameRepo.update(game);
  if (!updateResult.success)
    return NextResponse.json({ error: updateResult.error.message }, { status: 500 });

  const externalIdRows = [
    ...(body.rawg_id ? [{ game_id: id, source: "rawg", external_id: String(body.rawg_id) }] : []),
    ...(body.igdb_id ? [{ game_id: id, source: "igdb", external_id: String(body.igdb_id) }] : []),
  ];
  if (externalIdRows.length > 0) {
    await auth.client
      .from("game_external_ids")
      .upsert(externalIdRows, { ignoreDuplicates: false });
  }

  return NextResponse.json(gameStateToDto(game));
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const repo = createSupabaseGameRepository(auth.client);
  const result = await repo.delete(id);
  if (!result.success)
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
