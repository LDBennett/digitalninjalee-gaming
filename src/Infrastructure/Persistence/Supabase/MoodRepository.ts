import { SupabaseClient } from '@supabase/supabase-js';
import { MoodRepository } from '@/src/Domain/Repositories/MoodRepository';
import { MoodState } from '@/src/Domain/Models/Mood';
import { Result, ok, err } from '@/lib/result';
import { moodRowToDomain } from '@/src/Infrastructure/Persistence/Supabase/Mappers/MoodMapper';
import { MoodRow } from '@/src/Infrastructure/Persistence/Supabase/Types';

export function createSupabaseMoodRepository(client: SupabaseClient): MoodRepository {
  return {
    async findAll(): Promise<Result<MoodState[], Error>> {
      const { data, error } = await client
        .from('moods')
        .select('*')
        .order('name');

      if (error) return err(new Error(error.message));
      return ok((data as MoodRow[]).map(moodRowToDomain));
    },

    async findByIds(ids: string[]): Promise<Result<MoodState[], Error>> {
      if (ids.length === 0) return ok([]);

      const { data, error } = await client
        .from('moods')
        .select('*')
        .in('id', ids);

      if (error) return err(new Error(error.message));
      return ok((data as MoodRow[]).map(moodRowToDomain));
    },
  };
}
