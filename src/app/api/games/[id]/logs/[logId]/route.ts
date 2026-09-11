import { NextRequest, NextResponse } from "next/server";
import {
  requireAuth,
  createSupabaseGameLogRepository,
} from "@/src/lib/backend/backlog/infrastructure";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; logId: string }> },
) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const { id, logId } = await params;
  const body = await req.json().catch(() => ({}));

  if (body.content === undefined && body.is_private === undefined) {
    return NextResponse.json(
      { error: "At least one of 'content' or 'is_private' must be provided" },
      { status: 400 },
    );
  }

  let content: string | undefined;
  if (body.content !== undefined) {
    if (typeof body.content !== "string") {
      return NextResponse.json(
        { error: "Content must be a string" },
        { status: 400 },
      );
    }
    const trimmed = body.content.trim();
    if (trimmed.length < 1 || trimmed.length > 5000) {
      return NextResponse.json(
        { error: "Note content must be between 1 and 5000 characters" },
        { status: 400 },
      );
    }
    content = trimmed;
  }

  let isPrivate: boolean | undefined;
  if (body.is_private !== undefined) {
    if (typeof body.is_private !== "boolean") {
      return NextResponse.json(
        { error: "is_private must be a boolean" },
        { status: 400 },
      );
    }
    isPrivate = body.is_private;
  }

  const logRepo = createSupabaseGameLogRepository(auth.client);
  const result = await logRepo.updateNote(logId, id, auth.user.id, {
    content,
    isPrivate,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error.message }, { status: 404 });
  }

  return NextResponse.json(result.value);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; logId: string }> },
) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const { id, logId } = await params;
  const logRepo = createSupabaseGameLogRepository(auth.client);
  const result = await logRepo.deleteNote(logId, id, auth.user.id);

  if (!result.success) {
    return NextResponse.json({ error: result.error.message }, { status: 404 });
  }

  return NextResponse.json({ deleted: true });
}
