import { Result, ok, err } from '@/lib/result';
import { GameRepository } from '@/src/Domain/Repositories/GameRepository';
import { GameDto, gameStateToDto } from '@/src/Application/DTOs/GameDto';

export interface Input {
  id: string;
}

export interface Output {
  game: GameDto;
}

export async function execute(
  gameRepo: GameRepository,
  input: Input,
): Promise<Result<Output, Error>> {
  const result = await gameRepo.findById(input.id);
  if (!result.success) return err(new Error('Game not found'));
  return ok({ game: gameStateToDto(result.value) });
}
