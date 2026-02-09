-- Isolate job_contexts, evaluations, and candidate_profiles per user account.
-- Each user sees only their own jobs, candidates, and evaluations.

-- Enable RLS on tables (if not already)
ALTER TABLE job_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Drop overly permissive policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to delete job_contexts" ON job_contexts;
DROP POLICY IF EXISTS "Allow authenticated users to delete evaluations" ON evaluations;

-- job_contexts: users see only their own jobs
CREATE POLICY "Users see own job_contexts"
ON job_contexts FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Users insert own job_contexts"
ON job_contexts FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users update own job_contexts"
ON job_contexts FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users delete own job_contexts"
ON job_contexts FOR DELETE
USING (auth.uid() = created_by);

-- candidate_profiles: users see only candidates they created
CREATE POLICY "Users see own candidate_profiles"
ON candidate_profiles FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Users insert own candidate_profiles"
ON candidate_profiles FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users update own candidate_profiles"
ON candidate_profiles FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users delete own candidate_profiles"
ON candidate_profiles FOR DELETE
USING (auth.uid() = created_by);

-- evaluations: users see only evaluations for jobs they own
CREATE POLICY "Users see own job evaluations"
ON evaluations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM job_contexts j 
    WHERE j.id = evaluations.job_context_id 
    AND j.created_by = auth.uid()
  )
);

CREATE POLICY "Users insert evaluations for own jobs"
ON evaluations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM job_contexts j 
    WHERE j.id = evaluations.job_context_id 
    AND j.created_by = auth.uid()
  )
);

CREATE POLICY "Users update own job evaluations"
ON evaluations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM job_contexts j 
    WHERE j.id = evaluations.job_context_id 
    AND j.created_by = auth.uid()
  )
);

CREATE POLICY "Users delete own job evaluations"
ON evaluations FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM job_contexts j 
    WHERE j.id = evaluations.job_context_id 
    AND j.created_by = auth.uid()
  )
);
