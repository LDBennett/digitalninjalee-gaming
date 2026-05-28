import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/infrastructure/database/auth.server';
import { createSupabaseMoodRepository } from '@/src/infrastructure/database/mood.repo';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const repo = createSupabaseMoodRepository(auth.client);
  const result = await repo.findAll();
  if (!result.success) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json(result.value);
}
