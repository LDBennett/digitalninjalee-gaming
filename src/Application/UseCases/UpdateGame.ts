import { Result, ok, err } from '@/lib/result';
import { GameRepository } from '@/src/Domain/Repositories/GameRepository';
import { MoodRepository } from '@/src/Domain/Repositories/MoodRepository';
import { GameState, startPlaying, completeGame, dropGame, returnToBacklog, updateDetails, adjustPriority, replaceMoods } from '@/src/Domain/Models/Game';
import { createPlatform } from '@/src/Domain/ValueObjects/Platform';
import { createGameStatus } from '@/src/Domain/ValueObjects/GameStatus';
import { createPriorityScore } from '@/src/Domain/ValueObjects/PriorityScore';
import { GameDto, gameStateToDto } from '@/src/Application/DTOs/GameDto';

export interface Input {
  id: string;
  title?: string;
  platform?: string;
  status?: string;
  priority_score?: number;
  cover_url?: string | null;
  last_played_at?: string | null;
  mood_ids?: string[];
}

export interface Output {
  game: GameDto;
}

export async function execute(
  gameRepo: GameRepository,
  moodRepo: MoodRepository,
  input: Input,
): Promise<Result<Output, Error>> {
  const findResult = await gameRepo.findById(input.id);
  if (!findResult.success) return err(new Error('Game not found'));

  let game: GameState = findResult.value;

  if (input.status !== undefined && input.status !== game.status) {
    const nextStatusResult = createGameStatus(input.status);
    if (!nextStatusResult.success) return err(new Error(nextStatusResult.error));

    const nextStatus = nextStatusResult.value;
    let transitionResult: Result<GameState, string>;

    switch (nextStatus) {
      case 'playing':   transitionResult = startPlaying(game);      break;
      case 'completed': transitionResult = completeGame(game);      break;
      case 'dropped':   transitionResult = dropGame(game);          break;
      case 'backlog':   transitionResult = returnToBacklog(game);   break;
      default:          return err(new Error(`Unknown status: ${nextStatus}`));
    }
    if (!transitionResult.success) return err(new Error(transitionResult.error));
    game = transitionResult.value;
  }

  if (input.title !== undefined || input.platform !== undefined || input.cover_url !== undefined) {
    const platformResult = createPlatform(input.platform ?? game.platform);
    if (!platformResult.success) return err(new Error(platformResult.error));

    const detailsResult = updateDetails(
      game,
      input.title ?? game.title,
      platformResult.value,
      input.cover_url !== undefined ? input.cover_url : game.coverUrl,
    );
    if (!detailsResult.success) return err(new Error(detailsResult.error));
    game = detailsResult.value;
  }

  if (input.priority_score !== undefined) {
    const scoreResult = createPriorityScore(input.priority_score);
    if (!scoreResult.success) return err(new Error(scoreResult.error));
    const delta = scoreResult.value - game.priorityScore;
    game = adjustPriority(game, delta);
  }

  if (input.mood_ids !== undefined) {
    const moodsResult = await moodRepo.findByIds(input.mood_ids);
    if (!moodsResult.success) return err(moodsResult.error);
    game = replaceMoods(game, moodsResult.value);
  }

  const updateResult = await gameRepo.update(game);
  if (!updateResult.success) return err(updateResult.error);

  return ok({ game: gameStateToDto(game) });
}
