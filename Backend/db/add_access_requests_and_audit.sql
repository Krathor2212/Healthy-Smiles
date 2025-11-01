-- Add access requests table
CREATE TABLE IF NOT EXISTS access_requests (
  id SERIAL PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  requested_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, denied, expired
  message TEXT,
  responded_at TIMESTAMP,
  UNIQUE(patient_id, doctor_id, status) -- One pending request per doctor-patient pair
);

CREATE INDEX idx_access_requests_patient ON access_requests(patient_id);
CREATE INDEX idx_access_requests_doctor ON access_requests(doctor_id);
CREATE INDEX idx_access_requests_status ON access_requests(status);

-- Add audit log table for authorization changes
CREATE TABLE IF NOT EXISTS authorization_audit_log (
  id SERIAL PRIMARY KEY,
  authorization_id UUID REFERENCES doctor_authorizations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- granted, revoked, expired, modified
  performed_by VARCHAR(10) NOT NULL, -- patient, doctor, system
  old_expires_at TIMESTAMP,
  new_expires_at TIMESTAMP,
  old_is_active BOOLEAN,
  new_is_active BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX idx_audit_log_authorization ON authorization_audit_log(authorization_id);
CREATE INDEX idx_audit_log_patient ON authorization_audit_log(patient_id);
CREATE INDEX idx_audit_log_doctor ON authorization_audit_log(doctor_id);
CREATE INDEX idx_audit_log_action ON authorization_audit_log(action);
CREATE INDEX idx_audit_log_created ON authorization_audit_log(created_at DESC);

-- Alter notifications table to support both patients and doctors
-- First, make patient_id nullable
ALTER TABLE notifications ALTER COLUMN patient_id DROP NOT NULL;

-- Add new columns for multi-user support
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_type VARCHAR(10); -- patient, doctor
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_type VARCHAR(50); -- access_request, authorization
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;

-- Update existing notifications to use new schema
UPDATE notifications SET user_id = patient_id, user_type = 'patient' WHERE user_id IS NULL;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
