import { Result } from '@/src/domains/shared/result';
import { GameState } from '@/src/domains/backlog/models/game.types';

export interface GameFilter {
  status?: string | string[];
}

export interface GameRepository {
  findAll(filter?: GameFilter): Promise<Result<GameState[], Error>>;
  findById(id: string): Promise<Result<GameState, Error>>;
  save(game: GameState): Promise<Result<void, Error>>;
  update(game: GameState): Promise<Result<void, Error>>;
  delete(id: string): Promise<Result<void, Error>>;
}
