import { SupabaseClient } from "@supabase/supabase-js";
import { Result, ok, err } from "@/src/lib/backend/shared/result";
import {
  GameLogRepository,
  GameLogFilter,
  CreateNoteInput,
  UpdateNoteInput,
} from "@/src/lib/backend/backlog/repository/gameLog.repo";
import {
  GameLogEntry,
  GameLogPage,
} from "@/src/lib/backend/backlog/domain/models/gameLog.types";
import { GameLogRow } from "./db.types";
import { gameLogRowToDomain } from "./gameLog.mapper";

export function createSupabaseGameLogRepository(
  client: SupabaseClient,
): GameLogRepository {
  return {
    async findByGameId(
      gameId: string,
      filter?: GameLogFilter,
    ): Promise<Result<GameLogPage, Error>> {
      const limit = filter?.limit ?? 50;
      const { data, error } = await client.rpc("get_game_logs", {
        p_game_id: gameId,
        p_cursor_created_at: filter?.cursor?.createdAt ?? null,
        p_cursor_id: filter?.cursor?.id ?? null,
        p_limit: limit,
      });

      if (error) return err(new Error(error.message));

      const rows = (data ?? []) as GameLogRow[];
      const mappedEntries: GameLogEntry[] = [];

      for (const row of rows) {
        const mapped = gameLogRowToDomain(row);
        if (mapped.success) {
          mappedEntries.push(mapped.value);
        } else {
          return err(mapped.error);
        }
      }

      const entries = mappedEntries.slice(0, limit);
      const nextCursor =
        mappedEntries.length > limit && entries.length > 0
          ? {
              createdAt: entries[entries.length - 1].createdAt,
              id: entries[entries.length - 1].id,
            }
          : null;

      return ok({ entries, nextCursor });
    },

    async createNote(
      input: CreateNoteInput,
    ): Promise<Result<GameLogEntry, Error>> {
      const { data, error } = await client
        .from("game_logs")
        .insert({
          game_id: input.gameId,
          user_id: input.userId,
          type: "note",
          content: input.content.trim(),
          metadata: {},
          is_private: input.isPrivate ?? false,
        })
        .select()
        .single();

      if (error) return err(new Error(error.message));
      return gameLogRowToDomain(data as GameLogRow);
    },

    async updateNote(
      id: string,
      gameId: string,
      userId: string,
      input: UpdateNoteInput,
    ): Promise<Result<GameLogEntry, Error>> {
      const updatePayload: Record<string, unknown> = {};
      if (input.content !== undefined) {
        updatePayload.content = input.content.trim();
      }
      if (input.isPrivate !== undefined) {
        updatePayload.is_private = input.isPrivate;
      }

      const { data, error } = await client
        .from("game_logs")
        .update(updatePayload)
        .eq("id", id)
        .eq("game_id", gameId)
        .eq("user_id", userId)
        .eq("type", "note")
        .select()
        .maybeSingle();

      if (error) return err(new Error(error.message));
      if (!data) {
        return err(
          new Error(
            "Log note not found or you do not have permission to edit it",
          ),
        );
      }
      return gameLogRowToDomain(data as GameLogRow);
    },

    async deleteNote(
      id: string,
      gameId: string,
      userId: string,
    ): Promise<Result<void, Error>> {
      const { error, count } = await client
        .from("game_logs")
        .delete({ count: "exact" })
        .eq("id", id)
        .eq("game_id", gameId)
        .eq("user_id", userId)
        .eq("type", "note");

      if (error) return err(new Error(error.message));
      if (count === 0) {
        return err(
          new Error(
            "Log note not found or you do not have permission to delete it",
          ),
        );
      }
      return ok(undefined);
    },
  };
}
