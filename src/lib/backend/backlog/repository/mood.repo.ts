import { Result } from "@/src/lib/backend/shared/result";
import { MoodState } from "@/src/lib/backend/backlog/domain/models/mood.types";

export interface MoodRepository {
  findAll(): Promise<Result<MoodState[], Error>>;
  findByIds(ids: string[]): Promise<Result<MoodState[], Error>>;
}
