-- Allow unauthenticated (anon) users to read games data.
-- Required for public-facing endpoints like the random picker that use the anon key.

CREATE POLICY "anon can read games"
ON games
FOR SELECT
TO anon
USING (true);

CREATE POLICY "anon can read game_moods"
ON game_moods
FOR SELECT
TO anon
USING (true);

CREATE POLICY "anon can read moods"
ON moods
FOR SELECT
TO anon
USING (true);
