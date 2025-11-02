-- Migration: Add admin system and hospital assignments
-- Created: 2025-11-02

-- 1. Create hospitals table if not exists (matching existing schema)
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

-- 2. Insert the 3 hospitals (if they don't exist)
INSERT INTO hospitals (id, name, address, phone, image, rating, speciality)
VALUES 
    ('hospital_1', 'City General Hospital', '123 Main Street, Downtown', '+1-555-0101', '/hospitals/city-general.jpg', 4.5, 'General Medicine'),
    ('hospital_2', 'Sunrise Medical Center', '456 Oak Avenue, Westside', '+1-555-0102', '/hospitals/sunrise.jpg', 4.7, 'Multi-Specialty'),
    ('hospital_3', 'Greenwood Health Clinic', '789 Pine Road, Eastside', '+1-555-0103', '/hospitals/greenwood.jpg', 4.3, 'Family Medicine')
ON CONFLICT (id) DO NOTHING;

-- 3. Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create hospital_assignments table (junction table for doctors and hospitals)
CREATE TABLE IF NOT EXISTS hospital_assignments (
    id SERIAL PRIMARY KEY,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    hospital_id TEXT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES admins(id),
    UNIQUE(doctor_id, hospital_id)
);

-- 5. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hospital_assignments_doctor ON hospital_assignments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_hospital_assignments_hospital ON hospital_assignments(hospital_id);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- 6. Add role column to doctors table if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'doctors' AND column_name = 'role'
    ) THEN
        ALTER TABLE doctors ADD COLUMN role VARCHAR(20) DEFAULT 'doctor';
    END IF;
END $$;

-- 7. Add created_by column to doctors table to track admin who created the account
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'doctors' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE doctors ADD COLUMN created_by UUID REFERENCES admins(id);
    END IF;
END $$;

-- 8. Update existing doctors to have 'doctor' role
UPDATE doctors SET role = 'doctor' WHERE role IS NULL;

COMMENT ON TABLE hospitals IS 'Stores hospital information';
COMMENT ON TABLE admins IS 'Stores admin user credentials';
COMMENT ON TABLE hospital_assignments IS 'Junction table linking doctors to hospitals';
COMMENT ON COLUMN doctors.role IS 'User role: admin or doctor';
COMMENT ON COLUMN doctors.created_by IS 'References admin who created this doctor account';
