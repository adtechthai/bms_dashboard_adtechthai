-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'general',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view settings
CREATE POLICY "Users can view system settings" ON system_settings
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only admin users can modify settings
CREATE POLICY "Admin users can manage system settings" ON system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Insert default system settings
INSERT INTO system_settings (key, value, category, description) VALUES
    ('app_name', '"Leaniverse.co"'::jsonb, 'general', 'Application name'),
    ('app_description', '"Modern SaaS boilerplate built with Next.js, React, TypeScript, and Supabase"'::jsonb, 'general', 'Application description'),
    ('maintenance_mode', 'false'::jsonb, 'general', 'Enable maintenance mode'),
    ('allow_registration', 'true'::jsonb, 'general', 'Allow new user registrations'),
    
    ('smtp_host', '""'::jsonb, 'email', 'SMTP host server'),
    ('smtp_port', '587'::jsonb, 'email', 'SMTP port number'),
    ('smtp_user', '""'::jsonb, 'email', 'SMTP username'),
    ('smtp_password', '""'::jsonb, 'email', 'SMTP password (encrypted)'),
    ('email_notifications', 'true'::jsonb, 'email', 'Enable email notifications'),
    
    ('force_admin_2fa', 'true'::jsonb, 'security', 'Force 2FA for admin users'),
    ('session_timeout', '30'::jsonb, 'security', 'Session timeout in minutes'),
    ('auto_logout', 'true'::jsonb, 'security', 'Enable automatic logout'),
    ('password_min_length', '8'::jsonb, 'security', 'Minimum password length'),
    
    ('system_alerts', 'true'::jsonb, 'notifications', 'Enable system alerts'),
    ('user_notifications', 'true'::jsonb, 'notifications', 'Enable user notifications'),
    ('admin_notifications', 'true'::jsonb, 'notifications', 'Enable admin notifications'),
    
    ('primary_color', '"#3b82f6"'::jsonb, 'theme', 'Primary theme color'),
    ('dark_mode', 'false'::jsonb, 'theme', 'Enable dark mode')
ON CONFLICT (key) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();