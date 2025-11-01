-- Add table for doctor authorization and key sharing
CREATE TABLE IF NOT EXISTS doctor_authorizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  shared_key_enc TEXT NOT NULL, -- Patient's private key encrypted with doctor's public key
  authorized_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(patient_id, doctor_id)
);

CREATE INDEX IF NOT EXISTS idx_doctor_auth_patient ON doctor_authorizations(patient_id);
CREATE INDEX IF NOT EXISTS idx_doctor_auth_doctor ON doctor_authorizations(doctor_id);

-- Add El Gamal public key for doctors (so patients can encrypt keys for them)
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS elgamal_public_key TEXT;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS elgamal_private_key_enc TEXT;
