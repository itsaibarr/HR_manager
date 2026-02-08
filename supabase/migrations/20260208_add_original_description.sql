-- Add original_description field to job_contexts table
ALTER TABLE job_contexts 
ADD COLUMN IF NOT EXISTS original_description TEXT;

COMMENT ON COLUMN job_contexts.original_description IS 'Original job description text provided by user when creating the job posting';
