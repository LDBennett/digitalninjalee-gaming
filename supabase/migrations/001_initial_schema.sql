-- ── Enum types ────────────────────────────────────────────────────────────────

CREATE TYPE platform_type AS ENUM ('pc', 'xbox', 'playstation', 'switch', 'other');
CREATE TYPE game_status AS ENUM ('backlog', 'playing', 'completed', 'dropped', 'main-complete', 'ongoing', 'interested', 'pre-ordered', 'keep-an-eye-on');
CREATE TYPE replay_status_type AS ENUM ('want-to-replay', 'replaying');

-- ── Tables ────────────────────────────────────────────────────────────────────

CREATE TABLE games (
  id               UUID              DEFAULT gen_random_uuid() PRIMARY KEY,
  title            TEXT              NOT NULL,
  platform         platform_type     NOT NULL DEFAULT 'other',
  status           game_status       NOT NULL DEFAULT 'backlog',
  priority_score   INTEGER           DEFAULT 50 CHECK (priority_score >= 1 AND priority_score <= 100),
  background_url   TEXT,
  cover_art_url    TEXT,
  game_description TEXT,
  replay_status    replay_status_type,
  personal_note    TEXT,
  rating           NUMERIC(2,1)      CHECK (rating >= 0.5 AND rating <= 5),
  last_played_at   TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ       DEFAULT NOW(),
  created_at       TIMESTAMPTZ       DEFAULT NOW()
);

CREATE TABLE moods (
  id   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE game_moods (
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  mood_id UUID NOT NULL REFERENCES moods(id) ON DELETE CASCADE,
  PRIMARY KEY (game_id, mood_id)
);

CREATE TABLE game_external_ids (
  game_id        UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  source         TEXT NOT NULL,
  external_id    TEXT NOT NULL,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status    TEXT NOT NULL DEFAULT 'ok'
                 CHECK (sync_status IN ('ok', 'failed', 'pending')),
  PRIMARY KEY (game_id, source)
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX idx_games_status                    ON games(status);
CREATE INDEX idx_games_platform                  ON games(platform);
CREATE INDEX idx_game_moods_game_id              ON game_moods(game_id);
CREATE INDEX idx_game_moods_mood_id              ON game_moods(mood_id);
CREATE INDEX idx_game_external_ids_source_status ON game_external_ids(source, sync_status);

-- ── updated_at trigger ────────────────────────────────────────────────────────

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

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE games             ENABLE ROW LEVEL SECURITY;
ALTER TABLE moods             ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_moods        ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_external_ids ENABLE ROW LEVEL SECURITY;

-- games
CREATE POLICY games_read   ON games FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY games_insert ON games FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY games_update ON games FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY games_delete ON games FOR DELETE TO authenticated USING (true);

-- moods (public lookup table — no user data)
CREATE POLICY public_moods ON moods FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- game_moods
CREATE POLICY game_moods_read   ON game_moods FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY game_moods_insert ON game_moods FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY game_moods_delete ON game_moods FOR DELETE TO authenticated USING (true);

-- game_external_ids
CREATE POLICY game_external_ids_read   ON game_external_ids FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY game_external_ids_insert ON game_external_ids FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY game_external_ids_update ON game_external_ids FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY game_external_ids_delete ON game_external_ids FOR DELETE TO authenticated USING (true);

-- ── Grants ────────────────────────────────────────────────────────────────────

GRANT SELECT                         ON games, moods, game_moods, game_external_ids TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON games             TO authenticated;
GRANT SELECT                         ON moods             TO authenticated;
GRANT SELECT, INSERT, DELETE         ON game_moods        TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON game_external_ids TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON games             TO service_role;
GRANT SELECT                         ON moods             TO service_role;
GRANT SELECT, INSERT, DELETE         ON game_moods        TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON game_external_ids TO service_role;

-- ── Seed moods ────────────────────────────────────────────────────────────────

INSERT INTO moods (name) VALUES
  ('action'),
  ('adventure'),
  ('chill'),
  ('co-op'),
  ('family-friendly'),
  ('fighting'),
  ('indie'),
  ('multiplayer'),
  ('new-release'),
  ('online'),
  ('open-world'),
  ('puzzle'),
  ('quick-session'),
  ('retro'),
  ('rhythm'),
  ('roguelike'),
  ('rpg'),
  ('shooter'),
  ('sports'),
  ('story'),
  ('strategy'),
  ('tactical'),
  ('trophy-or-achievement-hunting'),
  ('vr');
