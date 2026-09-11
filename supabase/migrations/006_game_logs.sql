-- ── 006_game_logs.sql ────────────────────────────────────────────────────────
-- Game Logs & Activity Timeline:
-- 1. Table & enum for game logs (manual notes + automated lifecycle milestones).
-- 2. Schema-level constraints defending content rules and metadata invariants.
-- 3. Row-Level Security ensuring user-scoped note mutations and public read.
-- 4. SECURITY DEFINER trigger for atomic, tamper-proof lifecycle event capture.
-- 5. SECURITY INVOKER keyset pagination RPC using PostgreSQL native tuple comparisons.

-- ── 1. Enum & Table ──────────────────────────────────────────────────────────

CREATE TYPE public.game_log_type AS ENUM (
  'note',
  'status_change',
  'priority_change',
  'rating_change',
  'created'
);

CREATE TABLE public.game_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id    UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type       public.game_log_type NOT NULL,
  content    TEXT,
  metadata   JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_private BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 2. Table Integrity Constraints ───────────────────────────────────────────

-- Notes must have non-empty trimmed text (max 5,000 characters)
ALTER TABLE public.game_logs
  ADD CONSTRAINT game_logs_note_requires_content
  CHECK (type <> 'note' OR (content IS NOT NULL AND char_length(trim(content)) >= 1 AND char_length(content) <= 5000));

-- Automated events must not carry raw note content (data belongs in metadata)
ALTER TABLE public.game_logs
  ADD CONSTRAINT game_logs_event_requires_no_content
  CHECK (type = 'note' OR content IS NULL);

-- Automated milestone events are always public game history
ALTER TABLE public.game_logs
  ADD CONSTRAINT game_logs_automated_events_public
  CHECK (type = 'note' OR is_private = false);

-- Manual notes must not carry arbitrary JSONB metadata
ALTER TABLE public.game_logs
  ADD CONSTRAINT game_logs_note_metadata_empty
  CHECK (type <> 'note' OR metadata = '{}'::jsonb);

-- ── 3. Compound Index for Deterministic Keyset Ordering ───────────────────────

CREATE INDEX idx_game_logs_ordered ON public.game_logs (game_id, created_at DESC, id DESC);

-- ── 4. updated_at Trigger ────────────────────────────────────────────────────

CREATE TRIGGER game_logs_updated_at
  BEFORE UPDATE ON public.game_logs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 5. Row-Level Security ────────────────────────────────────────────────────

ALTER TABLE public.game_logs ENABLE ROW LEVEL SECURITY;

-- Public read: visitors see public logs; logged-in user also sees their private notes
CREATE POLICY "Read game_logs"
  ON public.game_logs FOR SELECT
  TO anon, authenticated
  USING (NOT is_private OR auth.uid() = user_id);

-- Client writes restricted strictly to manual 'note' entries
CREATE POLICY "Insert game_logs note"
  ON public.game_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND type = 'note');

CREATE POLICY "Update game_logs note"
  ON public.game_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND type = 'note')
  WITH CHECK (auth.uid() = user_id AND type = 'note');

CREATE POLICY "Delete game_logs note"
  ON public.game_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND type = 'note');

-- Grants
GRANT SELECT ON public.game_logs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_logs TO authenticated;
GRANT ALL ON public.game_logs TO service_role;

-- ── 6. Atomic Lifecycle DB Trigger ───────────────────────────────────────────
-- SECURITY DEFINER is required so the trigger executes with owner privileges to
-- insert system milestone rows ('created', 'status_change', etc.) that authenticated
-- users are deliberately forbidden from inserting directly via RLS.
-- search_path is strictly locked to prevent search-path shadowing vulnerabilities.

CREATE OR REPLACE FUNCTION public.trg_record_game_lifecycle_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.game_logs (game_id, user_id, type, metadata)
    VALUES (
      NEW.id,
      auth.uid(),
      'created',
      jsonb_build_object(
        'initial_status', NEW.status,
        'initial_priority', NEW.priority_score,
        'platform', NEW.platform
      )
    );
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Status transition
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      INSERT INTO public.game_logs (game_id, user_id, type, metadata)
      VALUES (
        NEW.id,
        auth.uid(),
        'status_change',
        jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
      );
    END IF;

    -- Priority change
    IF NEW.priority_score IS DISTINCT FROM OLD.priority_score THEN
      INSERT INTO public.game_logs (game_id, user_id, type, metadata)
      VALUES (
        NEW.id,
        auth.uid(),
        'priority_change',
        jsonb_build_object('old_priority', OLD.priority_score, 'new_priority', NEW.priority_score)
      );
    END IF;

    -- Rating change
    IF NEW.rating IS DISTINCT FROM OLD.rating THEN
      INSERT INTO public.game_logs (game_id, user_id, type, metadata)
      VALUES (
        NEW.id,
        auth.uid(),
        'rating_change',
        jsonb_build_object('old_rating', OLD.rating, 'new_rating', NEW.rating)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Revoke direct execution: trigger is only called by PostgreSQL internals on game mutations
REVOKE EXECUTE ON FUNCTION public.trg_record_game_lifecycle_log() FROM PUBLIC;

CREATE TRIGGER trg_games_lifecycle_log
  AFTER INSERT OR UPDATE ON public.games
  FOR EACH ROW EXECUTE FUNCTION public.trg_record_game_lifecycle_log();

-- ── 7. Keyset Pagination RPC Function ────────────────────────────────────────
-- SECURITY INVOKER ensures reads strictly obey game_logs Row-Level Security.
-- Uses native composite tuple comparison (created_at, id) < (cursor_created_at, cursor_id).
-- Defensively handles all-or-nothing cursor pairs and clamps pagination limits.

CREATE OR REPLACE FUNCTION public.get_game_logs(
  p_game_id UUID,
  p_cursor_created_at TIMESTAMPTZ DEFAULT NULL,
  p_cursor_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 50
)
RETURNS SETOF public.game_logs
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
  SELECT *
  FROM public.game_logs
  WHERE game_id = p_game_id
    AND (
      (p_cursor_created_at IS NULL AND p_cursor_id IS NULL)
      OR (
        p_cursor_created_at IS NOT NULL
        AND p_cursor_id IS NOT NULL
        AND (created_at, id) < (p_cursor_created_at, p_cursor_id)
      )
    )
  ORDER BY created_at DESC, id DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 100) + 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_game_logs(UUID, TIMESTAMPTZ, UUID, INT) TO anon, authenticated, service_role;
