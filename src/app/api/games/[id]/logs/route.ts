import { NextRequest, NextResponse } from "next/server";
import {
  requireAuth,
  optionalAuth,
  createSupabaseGameRepository,
  createSupabaseGameLogRepository,
} from "@/src/lib/backend/backlog/infrastructure";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth = await optionalAuth(req);

  const gameRepo = createSupabaseGameRepository(auth.client);
  const gameRes = await gameRepo.findById(id);
  if (!gameRes.success) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get("limit");
  const cursorCreatedAt = searchParams.get("cursor_created_at");
  const cursorId = searchParams.get("cursor_id");

  if ((cursorCreatedAt && !cursorId) || (!cursorCreatedAt && cursorId)) {
    return NextResponse.json(
      {
        error: "cursor_created_at and cursor_id must both be provided together",
      },
      { status: 400 },
    );
  }

  if (cursorCreatedAt && isNaN(Date.parse(cursorCreatedAt))) {
    return NextResponse.json(
      { error: "Invalid cursor_created_at timestamp" },
      { status: 400 },
    );
  }

  if (cursorId && !UUID_REGEX.test(cursorId)) {
    return NextResponse.json(
      { error: "Invalid cursor_id UUID" },
      { status: 400 },
    );
  }

  let limit = 50;
  if (limitParam) {
    const parsed = parseInt(limitParam, 10);
    if (isNaN(parsed) || parsed < 1) {
      return NextResponse.json({ error: "Invalid limit" }, { status: 400 });
    }
    limit = Math.min(parsed, 100);
  }

  const logRepo = createSupabaseGameLogRepository(auth.client);
  const result = await logRepo.findByGameId(id, {
    limit,
    cursor:
      cursorCreatedAt && cursorId
        ? { createdAt: cursorCreatedAt, id: cursorId }
        : undefined,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json(result.value);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const gameRepo = createSupabaseGameRepository(auth.client);
  const gameRes = await gameRepo.findById(id);
  if (!gameRes.success) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  if (typeof body.content !== "string") {
    return NextResponse.json(
      { error: "Note content must be provided as a string" },
      { status: 400 },
    );
  }

  const content = body.content.trim();
  if (content.length < 1 || content.length > 5000) {
    return NextResponse.json(
      { error: "Note content must be between 1 and 5000 characters" },
      { status: 400 },
    );
  }

  if (body.is_private !== undefined && typeof body.is_private !== "boolean") {
    return NextResponse.json(
      { error: "is_private must be a boolean" },
      { status: 400 },
    );
  }

  const logRepo = createSupabaseGameLogRepository(auth.client);
  const result = await logRepo.createNote({
    gameId: id,
    userId: auth.user.id,
    content,
    isPrivate: body.is_private ?? false,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json(result.value, { status: 201 });
}
