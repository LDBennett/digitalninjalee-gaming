-- Play sessions logged from Discord presence polling (every 10 min via Supabase Cron
-- -> Vercel /api/cron/discord-poll). Stored as sessions rather than raw poll logs:
-- a poll either extends the open session for the same game (last_seen_at bumped when
-- seen again within the merge gap) or starts a new row. A multi-hour play session is
-- therefore a single row. game_id is a soft link to the library — presence names that
-- don't match any library title are still logged by name.

CREATE TABLE play_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_name TEXT NOT NULL,
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_play_sessions_last_seen ON play_sessions (last_seen_at DESC);
CREATE INDEX idx_play_sessions_game_name ON play_sessions (game_name);

ALTER TABLE play_sessions ENABLE ROW LEVEL SECURITY;

-- Cron writer uses the service-role key (bypasses RLS, but grant explicitly for clarity)
GRANT SELECT, INSERT, UPDATE, DELETE ON play_sessions TO service_role;

-- Dashboard reads (anon browsing allowed, mirroring 002_anon_read_policies)
GRANT SELECT ON play_sessions TO anon, authenticated;

CREATE POLICY "anon can read play_sessions"
ON play_sessions
FOR SELECT
TO anon
USING (true);

CREATE POLICY "authenticated can read play_sessions"
ON play_sessions
FOR SELECT
TO authenticated
USING (true);
