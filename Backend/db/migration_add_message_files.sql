-- Migration to add file attachments to messages

-- Add file_id to messages table to link to medical_files
ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_id UUID REFERENCES medical_files(id) ON DELETE SET NULL;

-- Make text_enc nullable since file-only messages won't have text
ALTER TABLE messages ALTER COLUMN text_enc DROP NOT NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_messages_file_id ON messages(file_id);

-- Note: Messages can have text, file, or both
