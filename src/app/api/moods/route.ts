import { NextRequest, NextResponse } from "next/server";
import {
  requireAuth,
  createSupabaseMoodRepository,
} from "@/src/lib/backend/backlog/infrastructure";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const repo = createSupabaseMoodRepository(auth.client);
  const result = await repo.findAll();
  if (!result.success)
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json(result.value);
}
