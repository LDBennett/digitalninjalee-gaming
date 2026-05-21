import { Result, ok, err } from '@/lib/result';
import { GameRepository } from '@/src/Domain/Repositories/GameRepository';
import { GameDto, gameStateToDto } from '@/src/Application/DTOs/GameDto';

export interface Input {
  status?: string;
}

export interface Output {
  games: GameDto[];
}

export async function execute(
  gameRepo: GameRepository,
  input: Input = {},
): Promise<Result<Output, Error>> {
  const result = await gameRepo.findAll({ status: input.status });
  if (!result.success) return err(result.error);
  return ok({ games: result.value.map(gameStateToDto) });
}
