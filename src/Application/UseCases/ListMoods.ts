import { Result, ok, err } from '@/lib/result';
import { MoodRepository } from '@/src/Domain/Repositories/MoodRepository';
import { MoodDto, moodStateToDto } from '@/src/Application/DTOs/MoodDto';

export interface Output {
  moods: MoodDto[];
}

export async function execute(
  moodRepo: MoodRepository,
): Promise<Result<Output, Error>> {
  const result = await moodRepo.findAll();
  if (!result.success) return err(result.error);
  return ok({ moods: result.value.map(moodStateToDto) });
}
