import { MoodState } from '@/src/Domain/Models/Mood';
import { MoodRow } from '@/src/Infrastructure/Persistence/Supabase/Types';

export function moodRowToDomain(row: MoodRow): MoodState {
  return { id: row.id, name: row.name };
}

export function moodStateToRow(mood: MoodState): MoodRow {
  return { id: mood.id, name: mood.name };
}
