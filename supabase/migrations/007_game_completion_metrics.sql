-- Migration: Add time_to_beat and completion_roadmap JSONB columns to games table
ALTER TABLE games
  ADD COLUMN IF NOT EXISTS time_to_beat JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS completion_roadmap JSONB DEFAULT NULL;

COMMENT ON COLUMN games.time_to_beat IS 
  'Game completion hours: { schema_version, main, extra, completionist, source, hltb_id, url, synced_at }';

COMMENT ON COLUMN games.completion_roadmap IS 
  '100%/Platinum guide roadmap: { schema_version, difficulty, time_estimate, playthroughs, missables, difficulty_matters, guide_url, source_name, updated_at }';
