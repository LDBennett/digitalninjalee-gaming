-- Run this in your Supabase project: Dashboard > SQL Editor > New Query

-- Enum types
DO $$ BEGIN
  CREATE TYPE platform_type AS ENUM ('pc', 'xbox', 'playstation', 'switch', 'other');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Library statuses (owned): backlog, playing, completed, main-complete, ongoing, dropped
-- Wishlist statuses (not purchased): interested, pre-ordered, keep-an-eye-on
DO $$ BEGIN
  CREATE TYPE game_status AS ENUM ('backlog', 'playing', 'completed', 'dropped', 'main-complete', 'ongoing', 'interested', 'pre-ordered', 'keep-an-eye-on');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Games table
CREATE TABLE games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  external_id TEXT,
  platform platform_type NOT NULL DEFAULT 'other',
  status game_status NOT NULL DEFAULT 'backlog',
  priority_score INTEGER DEFAULT 50 CHECK (priority_score >= 1 AND priority_score <= 100),
  cover_url TEXT,
  cover_art_url TEXT,
  game_description TEXT,
  last_played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Moods lookup table
CREATE TABLE moods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Many-to-many join: games <-> moods
CREATE TABLE game_moods (
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  mood_id UUID NOT NULL REFERENCES moods(id) ON DELETE CASCADE,
  PRIMARY KEY (game_id, mood_id)
);

-- Seed moods
INSERT INTO moods (name) VALUES
  ('action'),
  ('chill'),
  ('story'),
  ('trophy-or-achievement-hunting'),
  ('online'),
  ('multiplayer'),
  ('co-op'),
  ('tactical'),
  ('puzzle'),
  ('quick-session'),
  ('new-release'),
  ('retro'),
  ('open-world'),
  ('rpg'),
  ('sports'),
  ('indie'),
  ('vr'),
  ('family-friendly'),
  ('roguelike'),
  ('strategy'),
  ('adventure'),
  ('fighting');

-- Row Level Security (open policies for personal use — add Supabase Auth later to lock it down)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_moods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_games"     ON games     FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_moods"     ON moods     FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_game_moods" ON game_moods FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- GRANTs are required when tables are created via SQL (not the Supabase Table Editor GUI)
-- anon: read-only
GRANT SELECT ON TABLE games      TO anon;
GRANT SELECT ON TABLE moods      TO anon;
GRANT SELECT ON TABLE game_moods TO anon;

-- authenticated: full write access (RLS policies further restrict per-row)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE games      TO authenticated;
GRANT SELECT                         ON TABLE moods      TO authenticated;
GRANT SELECT, INSERT, DELETE         ON TABLE game_moods TO authenticated;
