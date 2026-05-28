import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/infrastructure/database/auth.server';
import { createSupabaseGameRepository } from '@/src/infrastructure/database/game.repo';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const repo = createSupabaseGameRepository(auth.client);

  const result = await repo.getStatusCounts();
  if (!result.success) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json(result.value);
}
