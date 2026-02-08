-- Add is_active column to job_contexts table for active/inactive status toggle
ALTER TABLE job_contexts 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

COMMENT ON COLUMN job_contexts.is_active IS 'Whether this job context is currently active or archived';
