-- Run this in Supabase Dashboard > SQL Editor after enabling Email auth.
-- Splits the open "allow all" policies into read-only for anon and write for authenticated.

-- Drop the original open-access write policies
DROP POLICY IF EXISTS "public_games"      ON games;
DROP POLICY IF EXISTS "public_game_moods" ON game_moods;

-- READ: anyone (anon or authenticated) can browse games and moods
CREATE POLICY "games_read"      ON games      FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "game_moods_read" ON game_moods FOR SELECT TO anon, authenticated USING (true);

-- WRITE: authenticated users only
CREATE POLICY "games_insert"      ON games      FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "games_update"      ON games      FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "games_delete"      ON games      FOR DELETE TO authenticated USING (true);
CREATE POLICY "game_moods_insert" ON game_moods FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "game_moods_delete" ON game_moods FOR DELETE TO authenticated USING (true);
