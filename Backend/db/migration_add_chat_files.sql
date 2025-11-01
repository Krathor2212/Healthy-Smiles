-- Migration to add chat file support

-- Add chat_id to medical_files to link files shared in chat
ALTER TABLE medical_files ADD COLUMN IF NOT EXISTS chat_id UUID REFERENCES chat_contacts(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_medical_files_chat_id ON medical_files(chat_id);

-- Add a file_url column for simpler file access (optional)
ALTER TABLE medical_files ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Note: Files with chat_id will be visible in both chat and medical files section
