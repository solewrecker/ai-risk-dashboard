-- Reset and drop existing policies
DROP POLICY IF EXISTS "Allow admin full access" ON public.ai_tools;
DROP POLICY IF EXISTS "Allow service account read" ON public.ai_tools;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.ai_tools;
DROP POLICY IF EXISTS "Allow keyed read access" ON public.ai_tools;

DROP POLICY IF EXISTS "manage_own_assessments" ON public.assessments;
DROP POLICY IF EXISTS "service_full_access" ON public.assessments;
DROP POLICY IF EXISTS "allow_keyed_read" ON public.assessments;

-- Explicitly add is_public column to assessments table
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Enable Row Level Security
ALTER TABLE public.ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- AI Tools Policies
DO $$
BEGIN
  -- Admin full access policy
  CREATE POLICY "Allow admin full access" ON public.ai_tools
    FOR ALL
    TO authenticated
    WITH CHECK (auth.jwt()->>'role' = 'admin');

  -- Service role read access
  CREATE POLICY "Allow service account read" ON public.ai_tools
    FOR SELECT
    TO service_role
    USING (true);

  -- Authenticated users read access
  CREATE POLICY "Allow authenticated read access" ON public.ai_tools
    FOR SELECT
    TO authenticated
    USING (true);

  -- Public read access with API key
  CREATE POLICY "Allow keyed read access" ON public.ai_tools
    FOR SELECT
    TO anon
    USING (current_setting('request.headers', true)::json->>'apikey' = current_setting('app.api_key'));
END $$;

-- Assessments Policies
DO $$
BEGIN
  -- Users can manage only their own assessments
  CREATE POLICY "manage_own_assessments" ON public.assessments
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  -- Service role full access
  CREATE POLICY "service_full_access" ON public.assessments
    FOR ALL
    TO service_role
    USING (true);

  -- Public read access for shared assessments
  CREATE POLICY "allow_keyed_read" ON public.assessments
    FOR SELECT
    TO anon
    USING (
      current_setting('request.headers', true)::json->>'apikey' = current_setting('app.api_key')
      AND is_public = true
    );
END $$;

-- Table Constraints
ALTER TABLE public.ai_tools
  DROP COLUMN IF EXISTS breakdown,
  DROP COLUMN IF EXISTS details,
  ADD COLUMN IF NOT EXISTS detailed_assessment JSONB,
  ADD COLUMN IF NOT EXISTS recommendations JSONB;

ALTER TABLE public.assessments
  ADD CONSTRAINT user_id_not_null CHECK (user_id IS NOT NULL),
  ADD CONSTRAINT valid_total_score CHECK (total_score >= 0 AND total_score <= 100);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_ai_tools_category ON public.ai_tools(category);
CREATE INDEX IF NOT EXISTS idx_ai_tools_risk_level ON public.ai_tools(risk_level);
CREATE INDEX IF NOT EXISTS idx_ai_tools_total_score ON public.ai_tools(total_score);
CREATE INDEX IF NOT EXISTS idx_ai_tools_created_at ON public.ai_tools(created_at);
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON public.assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON public.assessments(created_at);

-- Text Search Extension and Index
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_ai_tools_name_trgm ON public.ai_tools USING gin (name gin_trgm_ops);

-- Policy Comments
COMMENT ON POLICY "Allow admin full access" ON public.ai_tools IS 'Admins have full CRUD access to AI tools';
COMMENT ON POLICY "Allow service account read" ON public.ai_tools IS 'Service role can read AI tools for backend operations';
COMMENT ON POLICY "Allow authenticated read access" ON public.ai_tools IS 'Authenticated users can read AI tools';
COMMENT ON POLICY "Allow keyed read access" ON public.ai_tools IS 'Public access with valid API key';
COMMENT ON POLICY "manage_own_assessments" ON public.assessments IS 'Users can only manage their own assessments';
COMMENT ON POLICY "service_full_access" ON public.assessments IS 'Service role has full access for backend operations';
COMMENT ON POLICY "allow_keyed_read" ON public.assessments IS 'Allow public read access to shared assessments with valid API key'; 