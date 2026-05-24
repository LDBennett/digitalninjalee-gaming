import { SupabaseClient } from '@supabase/supabase-js';
import { GameRepository, GameFilter, StatusCounts } from '@/src/domains/games/repository/game.repo';
import { GameState } from '@/src/domains/games/models/game.types';
import { Result, ok, err } from '@/src/domains/shared/result';
import { gameRowToDomain, gameStateToRow, gameMoodJunctionRows } from '@/src/infrastructure/database/game.mapper';
import { GameRowWithMoods } from '@/src/infrastructure/database/types';

const GAME_SELECT = '*, game_moods ( moods (*) )';

export function createSupabaseGameRepository(client: SupabaseClient): GameRepository {
  return {
    async findAll(filter?: GameFilter): Promise<Result<GameState[], Error>> {
      const PAGE_SIZE = 1000;
      const allRows: GameRowWithMoods[] = [];
      let from = 0;

      while (true) {
        let query = client
          .from('games')
          .select(GAME_SELECT)
          .order('priority_score', { ascending: false })
          .range(from, from + PAGE_SIZE - 1);

        if (filter?.status) {
          if (Array.isArray(filter.status)) {
            query = query.in('status', filter.status);
          } else {
            query = query.eq('status', filter.status);
          }
        }

        const { data, error } = await query;
        if (error) return err(new Error(error.message));

        allRows.push(...(data as GameRowWithMoods[]));
        if (data.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
      }

      return ok(allRows.map(gameRowToDomain));
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

    async getStatusCounts(): Promise<Result<StatusCounts, Error>> {
      const PAGE_SIZE = 1000;
      const counts: StatusCounts = {};
      let from = 0;

      while (true) {
        const { data, error } = await client
          .from('games')
          .select('status')
          .range(from, from + PAGE_SIZE - 1);

        if (error) return err(new Error(error.message));

        for (const row of data as { status: string }[]) {
          counts[row.status] = (counts[row.status] ?? 0) + 1;
        }

        if (data.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
      }

      return ok(counts);
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
      const { error: gameError } = await client.from('games').update(fields).eq('id', id);
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
