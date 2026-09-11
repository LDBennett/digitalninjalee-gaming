import { Result } from "@/src/lib/backend/shared/result";
import { GameLogEntry, GameLogPage } from "../domain/models/gameLog.types";

export interface GameLogFilter {
  limit?: number;
  cursor?: { createdAt: string; id: string };
}

export interface CreateNoteInput {
  gameId: string;
  userId: string;
  content: string;
  isPrivate?: boolean;
}

export interface UpdateNoteInput {
  content?: string;
  isPrivate?: boolean;
}

export interface GameLogRepository {
  findByGameId(
    gameId: string,
    filter?: GameLogFilter,
  ): Promise<Result<GameLogPage, Error>>;
  createNote(input: CreateNoteInput): Promise<Result<GameLogEntry, Error>>;
  updateNote(
    id: string,
    gameId: string,
    userId: string,
    input: UpdateNoteInput,
  ): Promise<Result<GameLogEntry, Error>>;
  deleteNote(
    id: string,
    gameId: string,
    userId: string,
  ): Promise<Result<void, Error>>;
}
