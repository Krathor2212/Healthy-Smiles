-- PostgreSQL schema for Healthy Smiles

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_enc TEXT NOT NULL,
  email_hmac TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name_enc TEXT,
  dob_enc TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_enc TEXT NOT NULL,
  email_hmac TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name_enc TEXT,
  specialty_enc TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medical_files (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  uploaded_by_role TEXT NOT NULL,
  uploaded_by_id UUID NOT NULL,
  filename_enc TEXT,
  description_enc TEXT,
  content_type TEXT,
  file_data BYTEA NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Extension for uuid generation (pgcrypto or pgcrypto alternative)
-- For gen_random_uuid() you may need to enable the pgcrypto extension:
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;
