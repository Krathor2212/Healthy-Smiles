-- Migration Script for Healthy Smiles Backend
-- This adds all new tables and columns for the complete API implementation
-- Run this AFTER your existing schema.sql

-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- MODIFY EXISTING TABLES
-- ============================================================

-- Add new columns to patients table for El Gamal encryption and profile data
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS phone_enc TEXT,
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS height_enc TEXT,
ADD COLUMN IF NOT EXISTS weight_enc TEXT,
ADD COLUMN IF NOT EXISTS elgamal_public_key JSONB,
ADD COLUMN IF NOT EXISTS elgamal_private_key_enc TEXT;

-- Modify medical_files table for El Gamal encryption
-- Drop the old file_data column and add El Gamal ciphertext columns
ALTER TABLE medical_files 
DROP COLUMN IF EXISTS file_data,
ADD COLUMN IF NOT EXISTS mime_type TEXT,
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS encrypted_c1 TEXT,
ADD COLUMN IF NOT EXISTS encrypted_c2 TEXT;

-- Update content_type to mime_type if needed
ALTER TABLE medical_files 
DROP COLUMN IF EXISTS content_type;

-- ============================================================
-- CREATE NEW TABLES
-- ============================================================

-- Password reset codes table
CREATE TABLE IF NOT EXISTS password_reset_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hmac TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_email_hmac ON password_reset_codes(email_hmac);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_expires_at ON password_reset_codes(expires_at);

-- Doctors data for app (static data with availability schedules)
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

-- Medicines catalog
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

-- Hospitals directory
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

-- Articles (health tips, news, etc.)
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

-- Create indexes for appointments
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

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

-- Create indexes for chat_contacts
CREATE INDEX IF NOT EXISTS idx_chat_contacts_patient_id ON chat_contacts(patient_id);
CREATE INDEX IF NOT EXISTS idx_chat_contacts_last_message_time ON chat_contacts(last_message_time);

-- Messages (encrypted chat messages)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chat_contacts(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL,
  sender_id UUID NOT NULL,
  text_enc TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Orders (pharmacy orders)
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

-- Create indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_patient_id ON orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

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

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_patient_id ON notifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0
);

-- ============================================================
-- SUMMARY
-- ============================================================

-- Display summary of changes
DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Modified tables:';
  RAISE NOTICE '  - patients (added 6 columns for El Gamal keys and profile)';
  RAISE NOTICE '  - medical_files (modified for El Gamal encryption)';
  RAISE NOTICE '';
  RAISE NOTICE 'Created tables:';
  RAISE NOTICE '  - password_reset_codes';
  RAISE NOTICE '  - doctors_data';
  RAISE NOTICE '  - medicines';
  RAISE NOTICE '  - hospitals';
  RAISE NOTICE '  - articles';
  RAISE NOTICE '  - appointments';
  RAISE NOTICE '  - chat_contacts';
  RAISE NOTICE '  - messages';
  RAISE NOTICE '  - orders';
  RAISE NOTICE '  - notifications';
  RAISE NOTICE '  - faqs';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Run sample_data.sql to insert test data';
  RAISE NOTICE '  2. Start the backend server with: npm run dev';
  RAISE NOTICE '============================================================';
END $$;
