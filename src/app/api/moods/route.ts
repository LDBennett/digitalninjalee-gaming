import { NextResponse } from 'next/server';
import { createServerClient } from '@/src/infrastructure/database/supabase.client';
import { createSupabaseMoodRepository } from '@/src/infrastructure/database/mood.repo';

export async function GET() {
  const repo = createSupabaseMoodRepository(createServerClient());
  const result = await repo.findAll();
  if (!result.success) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json(result.value);
}
