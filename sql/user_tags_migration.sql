-- User Tags System Migration
-- This creates the necessary tables for user tagging functionality

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  color VARCHAR(7) DEFAULT '#3b82f6', -- Default blue color in hex
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_tags junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS user_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tag_id) -- Prevent duplicate tag assignments
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_tags_user_id ON user_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tags_tag_id ON user_tags(tag_id);

-- Create updated_at trigger for tags table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default tags
INSERT INTO tags (name, color, description) VALUES
  ('VIP', '#fbbf24', 'VIP customers with premium access'),
  ('Beta Tester', '#8b5cf6', 'Users participating in beta testing'),
  ('Support', '#ef4444', 'Users requiring special support'),
  ('Partner', '#10b981', 'Business partners and affiliates'),
  ('Student', '#06b6d4', 'Students with educational discounts')
ON CONFLICT (name) DO NOTHING;

-- RLS Policies for tags table
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Admins can do everything with tags
CREATE POLICY "Admins can manage tags" ON tags
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- All authenticated users can read tags
CREATE POLICY "Users can read tags" ON tags
FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for user_tags table
ALTER TABLE user_tags ENABLE ROW LEVEL SECURITY;

-- Admins can manage all user tags
CREATE POLICY "Admins can manage user tags" ON user_tags
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Users can read their own tags
CREATE POLICY "Users can read their own tags" ON user_tags
FOR SELECT USING (user_id = auth.uid());