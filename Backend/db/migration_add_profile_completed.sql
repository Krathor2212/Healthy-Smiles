-- Migration: Add profile completion tracking for patients
-- Date: 2025-11-02
-- Description: Adds profile_completed flag and updates patients table

-- Add profile_completed flag to patients table
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- Set existing patients with phone as profile_completed = true
UPDATE patients
SET profile_completed = TRUE
WHERE phone_enc IS NOT NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_patients_profile_completed ON patients(profile_completed);

-- Verify the migration
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'patients' 
AND column_name = 'profile_completed';
