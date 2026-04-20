-- ================================================================
-- FOCUS MODE: Pomodoro Sessions Table
-- Run in: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ================================================================

-- 1. CREATE pomodoro_sessions table
CREATE TABLE IF NOT EXISTS public.pomodoro_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL,
  topic_id      UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  duration      INTEGER NOT NULL,  -- seconds completed
  type          TEXT NOT NULL DEFAULT 'work',  -- 'work' | 'short_break' | 'long_break'
  completed_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast per-user lookups
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_id
  ON public.pomodoro_sessions (user_id);

CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_topic_id
  ON public.pomodoro_sessions (user_id, topic_id);

-- 2. Enable RLS
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Allow all for testing" ON public.pomodoro_sessions;

-- Permissive policy (tighten after debugging)
CREATE POLICY "Allow all for testing"
  ON public.pomodoro_sessions FOR ALL
  USING (true) WITH CHECK (true);

-- 3. VERIFY — run this to confirm table exists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'pomodoro_sessions';
