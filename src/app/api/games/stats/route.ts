import { NextResponse } from 'next/server';
import { createServerClient } from '@/src/infrastructure/database/supabase.client';
import { createSupabaseGameRepository } from '@/src/infrastructure/database/game.repo';

export async function GET() {
  const client = createServerClient();
  const repo = createSupabaseGameRepository(client);

  const result = await repo.getStatusCounts();
  if (!result.success) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json(result.value);
}
