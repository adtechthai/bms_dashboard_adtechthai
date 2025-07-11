-- Add nickname column to profiles table
-- This allows users to set a display name that takes priority over first_name + last_name

-- Add the nickname column to the profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS nickname VARCHAR(100);

-- Add a comment to document the column
COMMENT ON COLUMN profiles.nickname IS 'Optional display name that takes priority over first_name + last_name when set';

-- The RLS policies for the profiles table should already allow users to update their own profiles
-- and admins to update any profile, so no additional policies are needed for this column.