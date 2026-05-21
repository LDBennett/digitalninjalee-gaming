import { Result } from '@/lib/result';
import { MoodState } from '@/src/Domain/Models/Mood';

export interface MoodRepository {
  findAll(): Promise<Result<MoodState[], Error>>;
  findByIds(ids: string[]): Promise<Result<MoodState[], Error>>;
}
