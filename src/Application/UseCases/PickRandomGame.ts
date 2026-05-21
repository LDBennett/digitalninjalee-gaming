import { Result, ok, err } from '@/lib/result';
import { GameRepository } from '@/src/Domain/Repositories/GameRepository';
import { GameDto, gameStateToDto } from '@/src/Application/DTOs/GameDto';

export interface Input {
  moodNames?: string[];
  status?: string;
}

export interface Output {
  game: GameDto | null;
  message?: string;
}

export async function execute(
  gameRepo: GameRepository,
  input: Input = {},
): Promise<Result<Output, Error>> {
  const status = input.status ?? 'backlog';
  const result = await gameRepo.findByStatus(status);
  if (!result.success) return err(result.error);

  const games = result.value;
  if (!games.length) return ok({ game: null, message: 'No games found' });

  let eligible = games;

  if (input.moodNames && input.moodNames.length > 0) {
    eligible = games.filter((game) =>
      input.moodNames!.some((name) => game.moods.some((m) => m.name === name)),
    );
  }

  if (!eligible.length) {
    return ok({ game: null, message: 'No games match those moods' });
  }

  const picked = eligible[Math.floor(Math.random() * eligible.length)];
  return ok({ game: gameStateToDto(picked) });
}
