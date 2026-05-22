-- Grant table-level access to service_role for admin/backfill operations.
-- service_role bypasses RLS but still needs explicit PostgreSQL GRANTs.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE games      TO service_role;
GRANT SELECT                         ON TABLE moods      TO service_role;
GRANT SELECT, INSERT, DELETE         ON TABLE game_moods TO service_role;
