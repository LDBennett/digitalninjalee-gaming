-- Run this in Supabase Dashboard > SQL Editor if you already ran 001_initial_schema.sql
-- WARNING: deleting 'slow-paced' and 'trophy' will also remove those tags from any games that used them.

DELETE FROM moods WHERE name IN ('slow-paced', 'trophy');

INSERT INTO moods (name) VALUES
  ('chill'),
  ('trophy-or-achievement-hunting'),
  ('online'),
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
  ('fighting')
ON CONFLICT (name) DO NOTHING;
