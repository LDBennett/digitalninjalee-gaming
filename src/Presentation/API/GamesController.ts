import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/src/Infrastructure/Persistence/Supabase/Client';
import { createSupabaseGameRepository } from '@/src/Infrastructure/Persistence/Supabase/GameRepository';
import { createSupabaseMoodRepository } from '@/src/Infrastructure/Persistence/Supabase/MoodRepository';
import * as ListGames from '@/src/Application/UseCases/ListGames';
import * as CreateGame from '@/src/Application/UseCases/CreateGame';
import * as GetGameById from '@/src/Application/UseCases/GetGameById';
import * as UpdateGame from '@/src/Application/UseCases/UpdateGame';
import * as DeleteGame from '@/src/Application/UseCases/DeleteGame';
import * as PickRandomGame from '@/src/Application/UseCases/PickRandomGame';

export async function getGames(request: NextRequest): Promise<NextResponse> {
  const status = new URL(request.url).searchParams.get('status') ?? undefined;
  const client = createServerClient();
  const result = await ListGames.execute(createSupabaseGameRepository(client), { status });
  if (!result.success) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json(result.value.games);
}

export async function createGameHandler(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const client = createServerClient();
  const result = await CreateGame.execute(
    createSupabaseGameRepository(client),
    createSupabaseMoodRepository(client),
    {
      title:          body.title,
      platform:       body.platform,
      status:         body.status,
      priority_score: body.priority_score,
      cover_url:      body.cover_url,
      mood_ids:       body.mood_ids ?? [],
    },
  );
  if (!result.success) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json(result.value.game, { status: 201 });
}

export async function getGameById(
  _request: NextRequest,
  params: { id: string },
): Promise<NextResponse> {
  const client = createServerClient();
  const result = await GetGameById.execute(createSupabaseGameRepository(client), { id: params.id });
  if (!result.success) return NextResponse.json({ error: result.error.message }, { status: 404 });
  return NextResponse.json(result.value.game);
}

export async function updateGame(
  request: NextRequest,
  params: { id: string },
): Promise<NextResponse> {
  const body = await request.json();
  const client = createServerClient();
  const result = await UpdateGame.execute(
    createSupabaseGameRepository(client),
    createSupabaseMoodRepository(client),
    { id: params.id, ...body },
  );
  if (!result.success) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json(result.value.game);
}

export async function deleteGame(
  _request: NextRequest,
  params: { id: string },
): Promise<NextResponse> {
  const client = createServerClient();
  const result = await DeleteGame.execute(createSupabaseGameRepository(client), { id: params.id });
  if (!result.success) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json(result.value);
}

export async function pickRandomGame(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const moodNames = searchParams.get('moods')?.split(',').filter(Boolean) ?? [];
  const status = searchParams.get('status') ?? 'backlog';
  const client = createServerClient();
  const result = await PickRandomGame.execute(createSupabaseGameRepository(client), { moodNames, status });
  if (!result.success) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json(result.value);
}
