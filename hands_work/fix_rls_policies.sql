-- =====================================================
-- Fix RLS Policies to Prevent Infinite Recursion
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Drop the problematic admin policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- The basic user policies already exist, so we skip recreating them
-- Just ensure the problematic admin policies are removed

-- For admin functionality, we'll use service role or custom functions
-- instead of RLS policies to avoid recursion

-- =====================================================
-- Alternative: Create a function for admin checks
-- =====================================================

-- Function to check if current user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Use security definer to bypass RLS
    SELECT role INTO user_role 
    FROM public.profiles 
    WHERE id = auth.uid();
    
    RETURN COALESCE(user_role = 'admin', FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- =====================================================
-- Create admin view with proper permissions
-- =====================================================

-- Create a view for admin operations that uses the function
CREATE OR REPLACE VIEW public.admin_profiles AS
SELECT * FROM public.profiles 
WHERE public.is_admin() = TRUE;

-- Grant permissions on the view
GRANT SELECT, UPDATE ON public.admin_profiles TO authenticated;