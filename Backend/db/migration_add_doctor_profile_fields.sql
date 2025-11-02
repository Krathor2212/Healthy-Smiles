-- Migration: Add additional profile fields to doctors table
-- Date: 2025-11-02
-- Description: Adds phone, qualifications, experience, hospital, address, and bio fields (encrypted)

-- Add new encrypted profile fields to doctors table
ALTER TABLE doctors
ADD COLUMN IF NOT EXISTS phone_enc TEXT,
ADD COLUMN IF NOT EXISTS qualifications_enc TEXT,
ADD COLUMN IF NOT EXISTS experience_enc TEXT,
ADD COLUMN IF NOT EXISTS hospital_enc TEXT,
ADD COLUMN IF NOT EXISTS address_enc TEXT,
ADD COLUMN IF NOT EXISTS bio_enc TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_doctors_phone_enc ON doctors(phone_enc);
CREATE INDEX IF NOT EXISTS idx_doctors_hospital_enc ON doctors(hospital_enc);

-- Verify the migration
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'doctors' 
ORDER BY ordinal_position;
