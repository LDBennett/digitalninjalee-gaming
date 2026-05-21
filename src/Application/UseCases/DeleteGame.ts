import { Result, ok, err } from '@/lib/result';
import { GameRepository } from '@/src/Domain/Repositories/GameRepository';

export interface Input {
  id: string;
}

export interface Output {
  success: boolean;
}

export async function execute(
  gameRepo: GameRepository,
  input: Input,
): Promise<Result<Output, Error>> {
  const result = await gameRepo.delete(input.id);
  if (!result.success) return err(result.error);
  return ok({ success: true });
}
