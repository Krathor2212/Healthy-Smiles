-- PostgreSQL schema for Healthy Smiles
-- Comprehensive schema with all migrations consolidated
-- Last updated: 2025-11-02

-- Extension for uuid generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- CORE USER TABLES
-- ============================================================================

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_enc TEXT NOT NULL,
  email_hmac TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name_enc TEXT,
  phone_enc TEXT,
  avatar TEXT,
  dob_enc TEXT,
  height_enc TEXT,
  weight_enc TEXT,
  elgamal_public_key JSONB,
  elgamal_private_key_enc TEXT,
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patients_profile_completed ON patients(profile_completed);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_enc TEXT NOT NULL,
  email_hmac TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name_enc TEXT,
  specialty_enc TEXT,
  phone_enc TEXT,
  qualifications_enc TEXT,
  experience_enc TEXT,
  hospital_enc TEXT,
  address_enc TEXT,
  bio_enc TEXT,
  profile_photo TEXT,
  elgamal_public_key TEXT,
  elgamal_private_key_enc TEXT,
  role VARCHAR(20) DEFAULT 'doctor',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_doctors_phone_enc ON doctors(phone_enc);
CREATE INDEX IF NOT EXISTS idx_doctors_hospital_enc ON doctors(hospital_enc);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- Add foreign key constraint for doctors.created_by after admins table is created
ALTER TABLE doctors DROP CONSTRAINT IF EXISTS doctors_created_by_fkey;
ALTER TABLE doctors ADD CONSTRAINT doctors_created_by_fkey FOREIGN KEY (created_by) REFERENCES admins(id);

-- ============================================================================
-- MEDICAL FILES AND KEY SHARING
-- ============================================================================

-- Medical files table
CREATE TABLE IF NOT EXISTS medical_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  uploaded_by_role TEXT NOT NULL,
  uploaded_by_id UUID NOT NULL,
  filename_enc TEXT,
  description_enc TEXT,
  mime_type TEXT,
  file_size BIGINT,
  encrypted_c1 TEXT NOT NULL,
  encrypted_c2 TEXT NOT NULL,
  chat_id UUID,
  file_url TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medical_files_patient ON medical_files(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_files_chat_id ON medical_files(chat_id);

-- Doctor authorizations (key sharing)
CREATE TABLE IF NOT EXISTS doctor_authorizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  shared_key_enc TEXT NOT NULL,
  authorized_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(patient_id, doctor_id)
);

CREATE INDEX IF NOT EXISTS idx_doctor_auth_patient ON doctor_authorizations(patient_id);
CREATE INDEX IF NOT EXISTS idx_doctor_auth_doctor ON doctor_authorizations(doctor_id);

-- Access requests
CREATE TABLE IF NOT EXISTS access_requests (
  id SERIAL PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  requested_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending',
  message TEXT,
  responded_at TIMESTAMP,
  UNIQUE(patient_id, doctor_id, status)
);

CREATE INDEX IF NOT EXISTS idx_access_requests_patient ON access_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_doctor ON access_requests(doctor_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);

-- Authorization audit log
CREATE TABLE IF NOT EXISTS authorization_audit_log (
  id SERIAL PRIMARY KEY,
  authorization_id UUID REFERENCES doctor_authorizations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  performed_by VARCHAR(10) NOT NULL,
  old_expires_at TIMESTAMP,
  new_expires_at TIMESTAMP,
  old_is_active BOOLEAN,
  new_is_active BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_audit_log_authorization ON authorization_audit_log(authorization_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_patient ON authorization_audit_log(patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_doctor ON authorization_audit_log(doctor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON authorization_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON authorization_audit_log(created_at DESC);

-- ============================================================================
-- PRESCRIPTIONS
-- ============================================================================

-- Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  diagnosis_enc TEXT,
  notes_enc TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);

-- Prescription items table
CREATE TABLE IF NOT EXISTS prescription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  medicine_id TEXT NOT NULL,
  dosage_enc TEXT NOT NULL,
  frequency_enc TEXT NOT NULL,
  duration_enc TEXT NOT NULL,
  instructions_enc TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prescription_items_prescription ON prescription_items(prescription_id);

-- ============================================================================
-- HOSPITALS AND ASSIGNMENTS
-- ============================================================================

-- Hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  speciality TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  distance TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  address TEXT,
  phone TEXT,
  email TEXT,
  emergency BOOLEAN DEFAULT false,
  departments JSONB,
  facilities JSONB,
  image TEXT
);

-- Hospital assignments (junction table for doctors and hospitals)
CREATE TABLE IF NOT EXISTS hospital_assignments (
  id SERIAL PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  hospital_id TEXT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by UUID REFERENCES admins(id),
  UNIQUE(doctor_id, hospital_id)
);

CREATE INDEX IF NOT EXISTS idx_hospital_assignments_doctor ON hospital_assignments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_hospital_assignments_hospital ON hospital_assignments(hospital_id);

-- ============================================================================
-- APP DATA (STATIC/LEGACY)
-- ============================================================================

-- Doctors data for app (static/legacy data)
CREATE TABLE IF NOT EXISTS doctors_data (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  experience TEXT,
  distance TEXT,
  image TEXT,
  about TEXT,
  hospital TEXT,
  hospital_id TEXT,
  consultation_fee INTEGER,
  availability JSONB,
  categories JSONB,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_doctors_data_doctor_id ON doctors_data(doctor_id);

-- Medicines table
CREATE TABLE IF NOT EXISTS medicines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  original_price INTEGER,
  currency TEXT DEFAULT '₹',
  size TEXT,
  description TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  image TEXT,
  category TEXT,
  manufacturer TEXT,
  prescription BOOLEAN DEFAULT false,
  stock INTEGER DEFAULT 0,
  on_sale BOOLEAN DEFAULT false
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  read_time TEXT,
  image TEXT,
  content TEXT,
  trending BOOLEAN DEFAULT false
);

-- ============================================================================
-- APPOINTMENTS
-- ============================================================================

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  doctor_image TEXT,
  specialty TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  reason_enc TEXT,
  status TEXT DEFAULT 'Confirmed',
  hospital_name TEXT,
  hospital_address TEXT,
  payment JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);

-- ============================================================================
-- CHAT AND MESSAGING
-- ============================================================================

-- Chat contacts table
CREATE TABLE IF NOT EXISTS chat_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  doctor_avatar TEXT,
  doctor_rating DECIMAL(2,1),
  last_message_enc TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  unread_count INTEGER DEFAULT 0,
  is_online BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_contacts_patient ON chat_contacts(patient_id);

-- Add foreign key for medical_files.chat_id
ALTER TABLE medical_files DROP CONSTRAINT IF EXISTS medical_files_chat_id_fkey;
ALTER TABLE medical_files ADD CONSTRAINT medical_files_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES chat_contacts(id) ON DELETE SET NULL;

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chat_contacts(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL,
  sender_id UUID NOT NULL,
  text_enc TEXT,
  file_id UUID REFERENCES medical_files(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_file_id ON messages(file_id);

-- ============================================================================
-- ORDERS AND PAYMENTS
-- ============================================================================

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL UNIQUE,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT '₹',
  delivery_address JSONB NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'Processing',
  estimated_delivery DATE,
  tracking_number TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_patient ON orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

-- Notifications table (supports both patients and doctors)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  user_id UUID,
  user_type VARCHAR(10),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  icon_name TEXT,
  icon_color TEXT,
  related_id TEXT,
  related_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_patient ON notifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ============================================================================
-- SECURITY
-- ============================================================================

-- Password reset codes
CREATE TABLE IF NOT EXISTS password_reset_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hmac TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_email ON password_reset_codes(email_hmac);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_codes(expires_at);

-- ============================================================================
-- MISCELLANEOUS
-- ============================================================================

-- FAQs table
CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE patients IS 'Stores patient user accounts with encrypted personal data';
COMMENT ON TABLE doctors IS 'Stores doctor/admin accounts with encrypted professional data';
COMMENT ON TABLE admins IS 'Stores admin user credentials for system management';
COMMENT ON TABLE hospitals IS 'Stores hospital information';
COMMENT ON TABLE hospital_assignments IS 'Junction table linking doctors to hospitals';
COMMENT ON TABLE medical_files IS 'Stores encrypted medical files using El Gamal encryption';
COMMENT ON TABLE doctor_authorizations IS 'Manages doctor access to patient medical files';
COMMENT ON TABLE access_requests IS 'Tracks doctor requests for patient file access';
COMMENT ON TABLE authorization_audit_log IS 'Audit trail for authorization changes';
COMMENT ON TABLE prescriptions IS 'Stores encrypted prescription data';
COMMENT ON TABLE prescription_items IS 'Stores encrypted prescription medicine items';
COMMENT ON TABLE messages IS 'Stores encrypted chat messages';
COMMENT ON TABLE notifications IS 'Stores user notifications for both patients and doctors';

COMMENT ON COLUMN doctors.role IS 'User role: admin or doctor';
COMMENT ON COLUMN doctors.created_by IS 'References admin who created this doctor account';
COMMENT ON COLUMN doctors.profile_photo IS 'Base64 encoded profile photo or URL';
COMMENT ON COLUMN patients.profile_completed IS 'Indicates if patient has completed profile setup';
COMMENT ON COLUMN messages.text_enc IS 'Encrypted message text (nullable for file-only messages)';
COMMENT ON COLUMN messages.file_id IS 'Reference to medical file attachment';
COMMENT ON COLUMN medical_files.chat_id IS 'Reference to chat if file was shared in chat';
