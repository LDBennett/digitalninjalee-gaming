import { NextResponse } from 'next/server';
import { createServerClient } from '@/src/Infrastructure/Persistence/Supabase/Client';
import { createSupabaseMoodRepository } from '@/src/Infrastructure/Persistence/Supabase/MoodRepository';
import * as ListMoods from '@/src/Application/UseCases/ListMoods';

export async function getMoods(): Promise<NextResponse> {
  const client = createServerClient();
  const result = await ListMoods.execute(createSupabaseMoodRepository(client));
  if (!result.success) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json(result.value.moods);
}
