import { Result, ok, err } from '@/lib/result';
import { GameRepository } from '@/src/Domain/Repositories/GameRepository';
import { MoodRepository } from '@/src/Domain/Repositories/MoodRepository';
import { newGame } from '@/src/Domain/Models/Game';
import { createPlatform } from '@/src/Domain/ValueObjects/Platform';
import { createGameStatus } from '@/src/Domain/ValueObjects/GameStatus';
import { createPriorityScore, DEFAULT_PRIORITY_SCORE } from '@/src/Domain/ValueObjects/PriorityScore';
import { GameDto, gameStateToDto } from '@/src/Application/DTOs/GameDto';

export interface Input {
  title: string;
  platform: string;
  status: string;
  priority_score?: number;
  cover_url?: string | null;
  mood_ids: string[];
}

export interface Output {
  game: GameDto;
}

export async function execute(
  gameRepo: GameRepository,
  moodRepo: MoodRepository,
  input: Input,
): Promise<Result<Output, Error>> {
  const platformResult = createPlatform(input.platform);
  if (!platformResult.success) return err(new Error(platformResult.error));

  const statusResult = createGameStatus(input.status);
  if (!statusResult.success) return err(new Error(statusResult.error));

  const scoreResult = createPriorityScore(input.priority_score ?? DEFAULT_PRIORITY_SCORE);
  if (!scoreResult.success) return err(new Error(scoreResult.error));

  const moodsResult = await moodRepo.findByIds(input.mood_ids);
  if (!moodsResult.success) return err(moodsResult.error);

  const gameResult = newGame({
    title: input.title,
    externalId: null,
    platform: platformResult.value,
    status: statusResult.value,
    priorityScore: scoreResult.value,
    coverUrl: input.cover_url ?? null,
    moods: moodsResult.value,
  });
  if (!gameResult.success) return err(new Error(gameResult.error));

  const saveResult = await gameRepo.save(gameResult.value);
  if (!saveResult.success) return err(saveResult.error);

  return ok({ game: gameStateToDto(gameResult.value) });
}
