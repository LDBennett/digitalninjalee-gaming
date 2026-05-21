-- Run this in your Supabase project: Dashboard > SQL Editor > New Query

-- Enum types
CREATE TYPE platform_type AS ENUM ('steam', 'xbox', 'playstation', 'other');
CREATE TYPE game_status AS ENUM ('backlog', 'playing', 'completed', 'dropped');

-- Games table
CREATE TABLE games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  external_id TEXT,
  platform platform_type NOT NULL DEFAULT 'other',
  status game_status NOT NULL DEFAULT 'backlog',
  priority_score INTEGER DEFAULT 50 CHECK (priority_score >= 1 AND priority_score <= 100),
  cover_url TEXT,
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
