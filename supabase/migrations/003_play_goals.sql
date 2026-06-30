-- Adds a fixed, multi-select "play goals" field to games (why you're playing it:
-- story completion, completionist, casual, multiplayer/co-op, competitive, exploration).
-- Stored as a plain enum array column, not a junction table, since the value set is
-- closed and fixed in code rather than an open/admin-managed list like moods.

CREATE TYPE play_goal_type AS ENUM (
  'story-completion',
  'completionist',
  'casual',
  'multiplayer-coop',
  'competitive',
  'exploration'
);

ALTER TABLE games ADD COLUMN play_goals play_goal_type[] NOT NULL DEFAULT '{}';
