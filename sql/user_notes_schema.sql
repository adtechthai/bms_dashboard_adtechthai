-- =====================================================
-- User Notes Schema
-- Adds user notes functionality for admin user management
-- =====================================================

-- Create user_notes table
CREATE TABLE IF NOT EXISTS user_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Add constraint to ensure content is not empty
    CONSTRAINT user_notes_content_not_empty CHECK (LENGTH(TRIM(content)) > 0)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_admin_id ON user_notes(admin_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_created_at ON user_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notes_user_created ON user_notes(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_notes
-- Only admins can view all notes
DROP POLICY IF EXISTS "Admins can view all user notes" ON user_notes;
CREATE POLICY "Admins can view all user notes" ON user_notes
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Only admins can create notes
DROP POLICY IF EXISTS "Admins can create user notes" ON user_notes;
CREATE POLICY "Admins can create user notes" ON user_notes
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Only the admin who created the note can update it
DROP POLICY IF EXISTS "Admins can update own notes" ON user_notes;
CREATE POLICY "Admins can update own notes" ON user_notes
    FOR UPDATE USING (
        admin_id = auth.uid() AND
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Only the admin who created the note can delete it
DROP POLICY IF EXISTS "Admins can delete own notes" ON user_notes;
CREATE POLICY "Admins can delete own notes" ON user_notes
    FOR DELETE USING (
        admin_id = auth.uid() AND
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Add helpful comments
COMMENT ON TABLE user_notes IS 'Admin notes for user management and tracking';
COMMENT ON COLUMN user_notes.user_id IS 'Reference to the user this note is about';
COMMENT ON COLUMN user_notes.admin_id IS 'Reference to the admin who created this note';
COMMENT ON COLUMN user_notes.content IS 'Text content of the note';
COMMENT ON COLUMN user_notes.attachments IS 'JSON array of file attachments with metadata';

-- Create trigger for updated_at timestamp (reuse existing function)
DROP TRIGGER IF EXISTS update_user_notes_updated_at ON user_notes;
CREATE TRIGGER update_user_notes_updated_at
    BEFORE UPDATE ON user_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for user note attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-notes-attachments', 'user-notes-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for user note attachments
-- Only admins can upload attachments
DROP POLICY IF EXISTS "Admins can upload note attachments" ON storage.objects;
CREATE POLICY "Admins can upload note attachments" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'user-notes-attachments' AND
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Only admins can view attachments
DROP POLICY IF EXISTS "Admins can view note attachments" ON storage.objects;
CREATE POLICY "Admins can view note attachments" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'user-notes-attachments' AND
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Only the admin who uploaded can delete attachments
DROP POLICY IF EXISTS "Admins can delete own attachments" ON storage.objects;
CREATE POLICY "Admins can delete own attachments" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'user-notes-attachments' AND
        owner = auth.uid() AND
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );