-- PostgreSQL schema for Healthy Smiles

-- Extension for uuid generation (pgcrypto or pgcrypto alternative)
-- For gen_random_uuid() you may need to enable the pgcrypto extension:
CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Password reset codes
CREATE TABLE IF NOT EXISTS password_reset_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hmac TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Doctors data for app (static data)
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
  categories JSONB
);

-- Medicines
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

-- Hospitals
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

-- Articles
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

-- Appointments
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

-- Chat contacts
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

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chat_contacts(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL,
  sender_id UUID NOT NULL,
  text_enc TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Orders
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

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  icon_name TEXT,
  icon_color TEXT,
  related_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0
);

-- Add prescription tables

CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  diagnosis_enc TEXT,
  notes_enc TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

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

CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescription_items_prescription ON prescription_items(prescription_id);

