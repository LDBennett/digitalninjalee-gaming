import { Result } from "@/src/lib/backend/shared/result";
import { GameState } from "@/src/lib/backend/backlog/domain/models/game.types";

export interface GameFilter {
  status?: string | string[];
}

export type StatusCounts = Record<string, number>;

export interface GameRepository {
  findAll(filter?: GameFilter): Promise<Result<GameState[], Error>>;
  findById(id: string): Promise<Result<GameState, Error>>;
  getStatusCounts(): Promise<Result<StatusCounts, Error>>;
  save(game: GameState): Promise<Result<void, Error>>;
  update(game: GameState): Promise<Result<void, Error>>;
  delete(id: string): Promise<Result<void, Error>>;
}
