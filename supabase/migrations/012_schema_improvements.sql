-- 012_schema_improvements.sql
--
-- 1. Indexes on heavily-queried columns (~1,100 games, 3,000-5,000 game_moods rows)
-- 2. updated_at column with auto-update trigger
-- 3. Replace external_id with game_external_ids table (supports multi-source: rawg, igdb, xbox, steam, psn)
-- 4. Rename cover_url → background_url (was RAWG background poster, not box art)
-- 5. Convert replay_status TEXT+CHECK to proper ENUM
-- 6. Add 'shooter' mood

-- ── 1. Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX idx_games_status       ON games(status);
CREATE INDEX idx_games_platform     ON games(platform);
CREATE INDEX idx_game_moods_game_id ON game_moods(game_id);
CREATE INDEX idx_game_moods_mood_id ON game_moods(mood_id);

-- ── 2. updated_at ─────────────────────────────────────────────────────────────

ALTER TABLE games ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 3. game_external_ids ──────────────────────────────────────────────────────

ALTER TABLE games DROP COLUMN external_id;

CREATE TABLE game_external_ids (
  game_id        UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  source         TEXT NOT NULL,
  external_id    TEXT NOT NULL,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status    TEXT NOT NULL DEFAULT 'ok'
                 CHECK (sync_status IN ('ok', 'failed', 'pending')),
  PRIMARY KEY (game_id, source)
);

CREATE INDEX idx_game_external_ids_source_status ON game_external_ids(source, sync_status);

-- RLS
ALTER TABLE game_external_ids ENABLE ROW LEVEL SECURITY;
CREATE POLICY game_external_ids_read   ON game_external_ids FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY game_external_ids_insert ON game_external_ids FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY game_external_ids_update ON game_external_ids FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY game_external_ids_delete ON game_external_ids FOR DELETE TO authenticated USING (true);

GRANT SELECT ON game_external_ids TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON game_external_ids TO authenticated, service_role;

-- ── 4. Rename cover_url → background_url ─────────────────────────────────────

ALTER TABLE games RENAME COLUMN cover_url TO background_url;

-- ── 5. Convert replay_status TEXT+CHECK to ENUM ───────────────────────────────

ALTER TABLE games DROP CONSTRAINT IF EXISTS games_replay_status_check;

CREATE TYPE replay_status_type AS ENUM ('want-to-replay', 'replaying');

ALTER TABLE games
  ALTER COLUMN replay_status TYPE replay_status_type
  USING replay_status::replay_status_type;

-- ── 6. Add shooter mood ───────────────────────────────────────────────────────

INSERT INTO moods (name) VALUES ('shooter') ON CONFLICT (name) DO NOTHING;
