-- Add preferences column to profiles table for user customization settings
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN profiles.preferences IS 'User preferences for dashboard customization (theme, layout, density, etc.)';
