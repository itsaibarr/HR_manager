-- Add DELETE policies for job_contexts
CREATE POLICY "Allow authenticated users to delete job_contexts"
ON job_contexts FOR DELETE
USING (auth.role() = 'authenticated');

-- Add DELETE policies for evaluations
CREATE POLICY "Allow authenticated users to delete evaluations"
ON evaluations FOR DELETE
USING (auth.role() = 'authenticated');
