-- ================================================================
-- FULL TABLE CREATION SCRIPT
-- Go to: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ================================================================

-- 1. CREATE mistakes table
CREATE TABLE IF NOT EXISTS public.mistakes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT NOT NULL,
  question_hash   TEXT NOT NULL,
  question        TEXT NOT NULL,
  options         JSONB NOT NULL,
  correct_answer  INTEGER NOT NULL,
  user_answer     INTEGER,
  explanation     TEXT,
  topic           TEXT DEFAULT 'General',
  times_wrong     INTEGER DEFAULT 1,
  times_correct   INTEGER DEFAULT 0,
  last_attempt_correct BOOLEAN DEFAULT FALSE,
  last_attempted  TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast per-user lookups
CREATE INDEX IF NOT EXISTS idx_mistakes_user_id 
  ON public.mistakes (user_id);

CREATE INDEX IF NOT EXISTS idx_mistakes_question_hash 
  ON public.mistakes (user_id, question_hash);

-- 2. CREATE user_topic_stats table
CREATE TABLE IF NOT EXISTS public.user_topic_stats (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT NOT NULL,
  topic_id        UUID,
  total_attempts  INTEGER DEFAULT 0,
  correct_count   INTEGER DEFAULT 0,
  accuracy        FLOAT DEFAULT 0,
  last_studied    TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, topic_id)
);

-- Index for fast per-user lookups
CREATE INDEX IF NOT EXISTS idx_user_topic_stats_user_id 
  ON public.user_topic_stats (user_id);

-- 3. CREATE learning_sessions table (if not exists)
CREATE TABLE IF NOT EXISTS public.learning_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          TEXT NOT NULL,
  topics_covered   JSONB,
  performance_score FLOAT DEFAULT 0,
  session_date     TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 4. ENABLE RLS + PERMISSIVE POLICIES (required to allow reads/writes)
-- ================================================================

ALTER TABLE public.mistakes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_topic_stats   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions  ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can manage own mistakes"     ON public.mistakes;
DROP POLICY IF EXISTS "Allow all for testing"             ON public.mistakes;
DROP POLICY IF EXISTS "Users can manage own stats"        ON public.user_topic_stats;
DROP POLICY IF EXISTS "Allow all stats for testing"       ON public.user_topic_stats;
DROP POLICY IF EXISTS "Allow all sessions for testing"    ON public.learning_sessions;

-- Create permissive policies (open for now, tighten after debugging)
CREATE POLICY "Allow all for testing"
  ON public.mistakes FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow all stats for testing"
  ON public.user_topic_stats FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow all sessions for testing"
  ON public.learning_sessions FOR ALL
  USING (true) WITH CHECK (true);

-- ================================================================
-- 5. VERIFY — run this to confirm tables exist
-- ================================================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('mistakes', 'user_topic_stats', 'learning_sessions');
