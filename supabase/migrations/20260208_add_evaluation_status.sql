-- Add status column to evaluations table
ALTER TABLE evaluations 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'shortlisted', 'rejected', 'interviewing', 'offered'));

COMMENT ON COLUMN evaluations.status IS 'Current status of the candidate evaluation in the hiring pipeline';
