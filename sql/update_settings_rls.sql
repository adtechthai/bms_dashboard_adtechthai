-- Update RLS policy to allow public access to app_name and app_description
DROP POLICY IF EXISTS "Users can view system settings" ON system_settings;

-- Allow public read access to basic app info
CREATE POLICY "Public can view basic app info" ON system_settings
    FOR SELECT USING (
        key IN ('app_name', 'app_description') OR
        auth.role() = 'authenticated'
    );

-- Keep existing admin policy for modifications
-- (Admin users can manage system settings policy already exists)