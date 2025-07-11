-- =====================================================
-- Add is_disabled column to profiles table
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Add is_disabled column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN DEFAULT FALSE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS profiles_is_disabled_idx ON public.profiles(is_disabled);

-- Update existing users to have is_disabled = false (if not already set)
UPDATE public.profiles 
SET is_disabled = FALSE 
WHERE is_disabled IS NULL;

-- Add constraint to ensure is_disabled is not null
ALTER TABLE public.profiles 
ALTER COLUMN is_disabled SET NOT NULL;