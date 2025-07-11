-- Email Configuration Migration
-- This creates the necessary table for storing email/SMTP configuration

-- Create email_config table
CREATE TABLE IF NOT EXISTS email_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  smtp_host VARCHAR(255) NOT NULL,
  smtp_port INTEGER NOT NULL DEFAULT 587,
  smtp_secure BOOLEAN DEFAULT false, -- true for 465, false for other ports
  smtp_user VARCHAR(255) NOT NULL,
  smtp_password TEXT NOT NULL, -- Encrypted in production
  from_email VARCHAR(255) NOT NULL,
  from_name VARCHAR(255) DEFAULT 'Admin',
  reply_to VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger for email_config table
CREATE TRIGGER update_email_config_updated_at BEFORE UPDATE ON email_config
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default email configuration (update these values)
INSERT INTO email_config (
  smtp_host, 
  smtp_port, 
  smtp_secure, 
  smtp_user, 
  smtp_password, 
  from_email, 
  from_name,
  reply_to
) VALUES (
  'smtp.gmail.com',
  587,
  false,
  'your-email@gmail.com',
  'your-app-password', -- Use App Password for Gmail
  'your-email@gmail.com',
  'Your App Name',
  'your-email@gmail.com'
) ON CONFLICT DO NOTHING;

-- RLS Policies for email_config table
ALTER TABLE email_config ENABLE ROW LEVEL SECURITY;

-- Only admins can access email configuration
CREATE POLICY "Admins can manage email config" ON email_config
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create email_logs table for tracking sent emails
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  subject TEXT NOT NULL,
  body TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed
  error_message TEXT,
  sent_by UUID REFERENCES profiles(id),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for email logs
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_by ON email_logs(sent_by);

-- RLS Policies for email_logs table
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all email logs
CREATE POLICY "Admins can view email logs" ON email_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Admins can insert email logs
CREATE POLICY "Admins can insert email logs" ON email_logs
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);