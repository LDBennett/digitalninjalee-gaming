import { SupabaseClient } from '@supabase/supabase-js';
import { MoodRepository } from '@/src/lib/backend/backlog/repository/mood.repo';
import { MoodState } from '@/src/lib/backend/backlog/domain/models/mood.types';
import { Result, ok, err } from '@/src/lib/backend/shared/result';
import { MoodRow } from '@/src/lib/backend/backlog/infrastructure/db.types';

function moodRowToDomain(row: MoodRow): MoodState {
  return { id: row.id, name: row.name };
}

export function createSupabaseMoodRepository(client: SupabaseClient): MoodRepository {
  return {
    async findAll(): Promise<Result<MoodState[], Error>> {
      const { data, error } = await client.from('moods').select('*').order('name');
      if (error) return err(new Error(error.message));
      return ok((data as MoodRow[]).map(moodRowToDomain));
    },

    async findByIds(ids: string[]): Promise<Result<MoodState[], Error>> {
      if (ids.length === 0) return ok([]);
      const { data, error } = await client.from('moods').select('*').in('id', ids);
      if (error) return err(new Error(error.message));
      return ok((data as MoodRow[]).map(moodRowToDomain));
    },
  };
}
