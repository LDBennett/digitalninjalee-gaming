import { SupabaseClient } from '@supabase/supabase-js';
import { GameRepository, GameFilter } from '@/src/Domain/Repositories/GameRepository';
import { GameState } from '@/src/Domain/Models/Game';
import { Result, ok, err } from '@/lib/result';
import { gameRowToDomain, gameStateToRow, gameMoodJunctionRows } from '@/src/Infrastructure/Persistence/Supabase/Mappers/GameMapper';
import { GameRowWithMoods } from '@/src/Infrastructure/Persistence/Supabase/Types';

const GAME_SELECT = '*, game_moods ( moods (*) )';

export function createSupabaseGameRepository(client: SupabaseClient): GameRepository {
  return {
    async findAll(filter?: GameFilter): Promise<Result<GameState[], Error>> {
      let query = client
        .from('games')
        .select(GAME_SELECT)
        .order('priority_score', { ascending: false });

      if (filter?.status) {
        query = query.eq('status', filter.status);
      }

      const { data, error } = await query;
      if (error) return err(new Error(error.message));
      return ok((data as GameRowWithMoods[]).map(gameRowToDomain));
    },

    async findById(id: string): Promise<Result<GameState, Error>> {
      const { data, error } = await client
        .from('games')
        .select(GAME_SELECT)
        .eq('id', id)
        .single();

      if (error) return err(new Error(error.message));
      return ok(gameRowToDomain(data as GameRowWithMoods));
    },

    async findByStatus(status: string): Promise<Result<GameState[], Error>> {
      const { data, error } = await client
        .from('games')
        .select(GAME_SELECT)
        .eq('status', status)
        .order('priority_score', { ascending: false });

      if (error) return err(new Error(error.message));
      return ok((data as GameRowWithMoods[]).map(gameRowToDomain));
    },

    async save(game: GameState): Promise<Result<void, Error>> {
      const row = gameStateToRow(game);

      const { error: gameError } = await client.from('games').insert(row);
      if (gameError) return err(new Error(gameError.message));

      const junctionRows = gameMoodJunctionRows(game);
      if (junctionRows.length > 0) {
        const { error: moodError } = await client.from('game_moods').insert(junctionRows);
        if (moodError) return err(new Error(moodError.message));
      }

      return ok(undefined);
    },

    async update(game: GameState): Promise<Result<void, Error>> {
      const { id, ...fields } = gameStateToRow(game);

      const { error: gameError } = await client
        .from('games')
        .update(fields)
        .eq('id', id);

      if (gameError) return err(new Error(gameError.message));

      await client.from('game_moods').delete().eq('game_id', id);

      const junctionRows = gameMoodJunctionRows(game);
      if (junctionRows.length > 0) {
        const { error: moodError } = await client.from('game_moods').insert(junctionRows);
        if (moodError) return err(new Error(moodError.message));
      }

      return ok(undefined);
    },

    async delete(id: string): Promise<Result<void, Error>> {
      const { error } = await client.from('games').delete().eq('id', id);
      if (error) return err(new Error(error.message));
      return ok(undefined);
    },
  };
}
