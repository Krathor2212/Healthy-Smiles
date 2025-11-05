-- Migration: Add push_token column to patients table
-- Date: 2025
-- Purpose: Store Expo push notification tokens for mobile app notifications

-- Add push_token column to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS push_token TEXT;

-- Add index for faster lookups when sending notifications
CREATE INDEX IF NOT EXISTS idx_patients_push_token ON patients(push_token) WHERE push_token IS NOT NULL;

-- Add comment to document the column
COMMENT ON COLUMN patients.push_token IS 'Expo push notification token for sending mobile notifications';
