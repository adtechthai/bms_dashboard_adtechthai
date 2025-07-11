-- Email Campaigns and History Migration
-- This migration creates tables to track email campaigns and their detailed history

-- Create email_campaigns table to track bulk email campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  total_recipients INTEGER NOT NULL DEFAULT 0,
  successful_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  delay_between_emails INTEGER NOT NULL DEFAULT 0, -- in milliseconds
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'completed', 'failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email_campaign_recipients table to track individual recipients per campaign
CREATE TABLE IF NOT EXISTS email_campaign_recipients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_campaigns_sent_by ON email_campaigns(sent_by);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at ON email_campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_campaign_id ON email_campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_status ON email_campaign_recipients(status);
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_email ON email_campaign_recipients(recipient_email);

-- Create updated_at trigger for email_campaigns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_email_campaigns_updated_at ON email_campaigns;
CREATE TRIGGER update_email_campaigns_updated_at
    BEFORE UPDATE ON email_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for email_campaigns
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all campaigns
CREATE POLICY "Admins can view all email campaigns" ON email_campaigns
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can insert campaigns
CREATE POLICY "Admins can create email campaigns" ON email_campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can update campaigns
CREATE POLICY "Admins can update email campaigns" ON email_campaigns
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for email_campaign_recipients
ALTER TABLE email_campaign_recipients ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all campaign recipients
CREATE POLICY "Admins can view all campaign recipients" ON email_campaign_recipients
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can insert campaign recipients
CREATE POLICY "Admins can create campaign recipients" ON email_campaign_recipients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can update campaign recipients
CREATE POLICY "Admins can update campaign recipients" ON email_campaign_recipients
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create a view for campaign summary with recipient details
CREATE OR REPLACE VIEW email_campaign_summary AS
SELECT 
  c.id,
  c.subject,
  c.body,
  c.total_recipients,
  c.successful_count,
  c.failed_count,
  c.delay_between_emails,
  c.status,
  c.started_at,
  c.completed_at,
  c.sent_by,
  c.created_at,
  c.updated_at,
  p.first_name as sender_first_name,
  p.last_name as sender_last_name,
  p.email as sender_email,
  ROUND((c.successful_count::DECIMAL / NULLIF(c.total_recipients, 0)) * 100, 2) as success_rate,
  CASE 
    WHEN c.completed_at IS NOT NULL AND c.started_at IS NOT NULL 
    THEN EXTRACT(EPOCH FROM (c.completed_at - c.started_at))::INTEGER
    ELSE NULL 
  END as duration_seconds
FROM email_campaigns c
LEFT JOIN profiles p ON c.sent_by = p.id
ORDER BY c.created_at DESC;

-- Grant permissions on the view
GRANT SELECT ON email_campaign_summary TO authenticated;