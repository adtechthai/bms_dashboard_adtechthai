-- =====================================================
-- Fix Admin RLS Policies for User Management
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create a function that checks if the current user is an admin (safe from recursion)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
    -- Direct query without RLS to avoid recursion
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin policies that use the function
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        public.is_admin_user() = true
    );

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        public.is_admin_user() = true
    );

CREATE POLICY "Admins can delete profiles" ON public.profiles
    FOR DELETE USING (
        public.is_admin_user() = true
    );

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;