import { MoodState } from '@/src/Domain/Models/Mood';

export interface MoodDto {
  id: string;
  name: string;
}

export function moodStateToDto(mood: MoodState): MoodDto {
  return { id: mood.id, name: mood.name };
}
