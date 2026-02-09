-- Add UPDATE policy for evaluations table to allow status changes
CREATE POLICY "Allow authenticated users to update evaluations"
ON evaluations FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
