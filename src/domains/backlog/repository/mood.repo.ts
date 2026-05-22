import { Result } from '@/src/domains/shared/result';
import { MoodState } from '@/src/domains/backlog/models/mood.types';

export interface MoodRepository {
  findAll(): Promise<Result<MoodState[], Error>>;
  findByIds(ids: string[]): Promise<Result<MoodState[], Error>>;
}
