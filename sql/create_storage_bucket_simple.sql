-- =====================================================
-- Supabase Storage Bucket Creation (SQL Part Only)
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Note: Storage policies must be created via the Supabase Dashboard
-- Go to Storage > Policies in your Supabase Dashboard to create the policies manually