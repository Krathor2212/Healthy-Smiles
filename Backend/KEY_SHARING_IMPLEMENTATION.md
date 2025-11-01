# Key-Sharing Implementation Summary

## ✅ Completed Backend Setup

### 1. Database Migration
- Created `doctor_authorizations` table to track patient-doctor authorization
- Added El Gamal encryption key columns to `doctors` table:
  - `elgamal_public_key` - Doctor's public key (for encrypting shared keys)
  - `elgamal_private_key_enc` - Doctor's private key (AES-encrypted)
- Generated El Gamal keys for existing doctor in database

### 2. Authorization System
**File**: `Backend/src/controllers/authorizationController.js`

**Grant Access** (`/api/authorizations/grant`):
- Patient can authorize a doctor to view their medical files
- Patient's private key is encrypted with doctor's El Gamal public key
- Encrypted key stored in `doctor_authorizations.shared_key_enc`
- Supports optional expiration date
- UPSERT support (updates existing authorizations)

**Revoke Access** (`/api/authorizations/revoke/:doctorId`):
- Sets `is_active = false` for immediate revocation
- Maintains audit trail

**List Authorizations** (`/api/authorizations`):
- Role-aware: Returns authorized doctors for patients, authorized patients for doctors
- Includes authorization status, expiration dates

### 3. File Access Updates
**File**: `Backend/src/controllers/fileController.js`

**Updated downloadMedicalFile**:
- Checks if doctor has active authorization
- Retrieves shared_key_enc from doctor_authorizations table
- Decrypts doctor's private key (from doctors.elgamal_private_key_enc)
- Decrypts shared_key_enc to obtain patient's private key
- Uses patient's private key to decrypt the medical file
- Returns 403 "Not authorized" if no valid authorization exists

### 4. API Routes
**File**: `Backend/src/routes/authorizations.js`
- `POST /api/authorizations/grant` - Grant doctor access
- `DELETE /api/authorizations/revoke/:doctorId` - Revoke doctor access
- `GET /api/authorizations` - List authorizations (role-aware)

All routes protected with `authenticateToken` middleware.

## 🔐 Security Architecture

### Encryption Flow:
1. **Patient files** are encrypted with patient's El Gamal public key
2. **Patient's private key** is stored AES-encrypted in database
3. When **granting access**:
   - Patient's private key is decrypted (AES)
   - Re-encrypted with doctor's El Gamal public key
   - Stored as `shared_key_enc` in doctor_authorizations
4. When **doctor views file**:
   - System retrieves `shared_key_enc`
   - Decrypts with doctor's private key
   - Obtains patient's private key
   - Decrypts medical file

### Key Features:
- ✅ Patient private keys never exposed in plaintext
- ✅ Each doctor gets their own encrypted copy
- ✅ Immediate revocation via is_active flag
- ✅ Optional expiration dates
- ✅ Audit trail maintained
- ✅ UPSERT support (no duplicate authorizations)

## 📋 Next Steps - Frontend Implementation

### Patient Mobile App (React Native)
**New Screen**: `AuthorizedDoctors.tsx` (in Profile section)

**Features Needed**:
1. List of authorized doctors with status badges
2. "Grant Access" button → Select doctor, set expiration (optional)
3. "Revoke Access" button for each authorized doctor
4. Visual indication of expiration dates
5. Success/error notifications

**API Calls**:
```typescript
// Grant access
POST /api/authorizations/grant
Body: { doctorId: string, expiresInDays?: number }

// Revoke access
DELETE /api/authorizations/revoke/:doctorId

// Get list of authorizations
GET /api/authorizations
```

### Doctor Web App (React)
**Update**: `Patients.tsx`

**Features Needed**:
1. Authorization status badge for each patient:
   - "Authorized ✓" (green) if active
   - "Not Authorized" (gray) if no access
   - "Expired" (red) if authorization expired
2. Show expiration date when authorized
3. Better error message when file access denied
4. Loading states during authorization checks

**API Calls**:
```typescript
// Get authorization list
GET /api/authorizations
// Response: Array of { patient_id, is_active, expires_at, authorized_at }
```

### Testing Checklist
- [ ] Patient grants access to doctor
- [ ] Doctor can view patient files
- [ ] Patient revokes access
- [ ] Doctor gets 403 error after revocation
- [ ] Test expiration (grant with expiresInDays, verify access denied after)
- [ ] Test UPSERT (grant same doctor twice)
- [ ] Test multiple patients/doctors
- [ ] Test authorization list API for both roles
- [ ] Test file decryption correctness

## 📊 Database Schema

### `doctor_authorizations` table:
```sql
id                   SERIAL PRIMARY KEY
patient_id           UUID NOT NULL (FK → patients.id)
doctor_id            UUID NOT NULL (FK → doctors.id)
shared_key_enc       TEXT NOT NULL (patient private key encrypted with doctor public key)
authorized_at        TIMESTAMP DEFAULT NOW()
expires_at           TIMESTAMP (optional)
is_active            BOOLEAN DEFAULT TRUE

UNIQUE (patient_id, doctor_id)
INDEX ON patient_id
INDEX ON doctor_id
```

### Updated `doctors` table:
```sql
elgamal_public_key      TEXT (JSON-stringified public key)
elgamal_private_key_enc TEXT (AES-encrypted private key)
```

## 🚀 Migration Scripts

**Run Migration**:
```bash
cd Backend
node db/runMigration.js
```

**Generate Keys for Existing Doctors**:
```bash
cd Backend
node db/generateDoctorKeys.js
```

**For New Doctors**:
Update doctor registration/signup code to generate El Gamal keys automatically.

## 🔧 Implementation Notes

### Error Handling:
- **403 "Not authorized"** - Doctor has no active authorization
- **403 "Access denied"** - User is neither patient nor authorized doctor
- **404 "File not found"** - File doesn't exist or was deleted

### Performance Considerations:
- Indexes on patient_id and doctor_id ensure fast authorization lookups
- UNIQUE constraint prevents duplicate authorizations
- Soft deletion (is_active) maintains audit trail

### Future Enhancements:
- Notification system when patient grants/revokes access
- "Request Access" feature for doctors
- Bulk authorization management
- Authorization history/audit log
- Time-limited sharing (auto-expire feature)

---

**Status**: ✅ Backend fully implemented and ready for frontend integration
**Last Updated**: February 2025
