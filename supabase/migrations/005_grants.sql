-- Grant table-level access to anon and authenticated roles.
-- Required because tables were created via SQL Editor, not the Supabase Table Editor,
-- so Supabase did not auto-grant role access.
-- RLS policies restrict what each role can actually do; these GRANTs just allow them to touch the tables at all.

-- anon: read-only
GRANT SELECT ON TABLE games      TO anon;
GRANT SELECT ON TABLE moods      TO anon;
GRANT SELECT ON TABLE game_moods TO anon;

-- authenticated: full write access (RLS policies further restrict per-row)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE games      TO authenticated;
GRANT SELECT                         ON TABLE moods      TO authenticated;
GRANT SELECT, INSERT, DELETE         ON TABLE game_moods TO authenticated;
