import { Result } from '@/lib/result';
import { GameState } from '@/src/Domain/Models/Game';

export interface GameFilter {
  status?: string;
}

export interface GameRepository {
  findAll(filter?: GameFilter): Promise<Result<GameState[], Error>>;
  findById(id: string): Promise<Result<GameState, Error>>;
  findByStatus(status: string): Promise<Result<GameState[], Error>>;
  save(game: GameState): Promise<Result<void, Error>>;
  update(game: GameState): Promise<Result<void, Error>>;
  delete(id: string): Promise<Result<void, Error>>;
}
