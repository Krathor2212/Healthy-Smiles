-- Migration to link doctors and doctors_data tables

-- Add doctor_id column to doctors_data to reference doctors table
ALTER TABLE doctors_data ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_doctors_data_doctor_id ON doctors_data(doctor_id);

-- Note: Existing doctors_data records will have NULL doctor_id
-- New doctors should be added to both tables and linked via doctor_id
