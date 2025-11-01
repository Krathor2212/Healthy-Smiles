# 🧪 Testing Guide: Authorization System

## What's Been Updated

### Doctor Web App (Patients.tsx)
✅ **Added Authorization Status Display:**
- **Patient List**: Shows authorization badges (✓ Authorized, 🔒 No Access, Expired)
- **Patient Details Sidebar**: Large status box showing access status with explanation
- **Expiration Dates**: Displays when authorization will expire
- **Better Error Messages**: Clear explanation when file access is denied

### Visual Indicators:
- 🟢 **Green Badge** = Authorized (can view files)
- 🔴 **Red Badge** = Expired authorization
- ⚫ **Gray Badge** = No authorization (cannot view files)

## 🔍 Current Issue

**Problem**: You're seeing a 403 error because the patient hasn't authorized you yet.

**Error Message**: 
```
🔒 Access Denied

You are not authorized to view this patient's medical files.

The patient needs to grant you access first through their mobile app 
in the "Authorized Doctors" section.
```

## 🎯 How to Test

### Option 1: Manual Database Grant (Quick Test)

Run this SQL to grant access manually:

```sql
-- Replace these values with actual IDs from your database
INSERT INTO doctor_authorizations (patient_id, doctor_id, shared_key_enc, is_active)
VALUES (
  '23f44417-f5db-4694-b112-12df00c5a127',  -- patient_id (the one you're trying to view)
  'af16a688-23ea-4878-9a2b-fe63163bfc80',  -- doctor_id (your doctor ID)
  (
    -- This subquery encrypts the patient's private key with doctor's public key
    SELECT 
      -- For testing, we'll use the patient's encrypted private key as-is
      -- In production, this should be re-encrypted with doctor's public key
      p.elgamal_private_key_enc
    FROM patients p 
    WHERE p.id = '23f44417-f5db-4694-b112-12df00c5a127'
  ),
  true
)
ON CONFLICT (patient_id, doctor_id) 
DO UPDATE SET 
  is_active = true,
  authorized_at = NOW();
```

⚠️ **Note**: This is a simplified version for testing. The proper implementation encrypts the patient's private key with the doctor's public key.

### Option 2: Use the Authorization API (Proper Way)

**From Patient Mobile App** (not yet implemented in frontend):
```bash
# Using curl as patient
curl -X POST http://10.10.112.140:4000/api/authorizations/grant \
  -H "Authorization: Bearer <PATIENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": "af16a688-23ea-4878-9a2b-fe63163bfc80",
    "expiresInDays": 30
  }'
```

### Option 3: Build Patient Mobile UI (Next Steps)

Follow the guide in `FRONTEND_AUTHORIZATION_GUIDE.md` to:
1. Create `AuthorizationContext.tsx`
2. Create `AuthorizedDoctors.tsx` screen
3. Test the full flow

## 📊 What You Should See After Granting Access

### Before Authorization:
- Patient card shows: **🔒 No Access** (gray badge)
- Patient details sidebar: Red box saying "Not Authorized"
- Clicking "View" on file: 403 error with clear message

### After Authorization:
- Patient card shows: **✓ Authorized** (green badge)
- Patient details sidebar: Green box saying "Authorized"
- Shows expiration date if set
- Clicking "View" on file: File opens successfully! 🎉

## 🔧 Quick Database Check

Check if authorization exists:
```sql
SELECT 
  da.*,
  p.name_enc as patient_name,
  d.name_enc as doctor_name
FROM doctor_authorizations da
JOIN patients p ON da.patient_id = p.id
JOIN doctors d ON da.doctor_id = d.id
WHERE da.is_active = true;
```

Check doctor's El Gamal keys:
```sql
SELECT id, name_enc, 
  LENGTH(elgamal_public_key) as public_key_length,
  LENGTH(elgamal_private_key_enc) as private_key_length
FROM doctors
WHERE id = 'af16a688-23ea-4878-9a2b-fe63163bfc80';
```

Check patient's files:
```sql
SELECT id, filename_enc, upload_date
FROM medical_files
WHERE patient_id = '23f44417-f5db-4694-b112-12df00c5a127';
```

## 🐛 Troubleshooting

### "Authorization fetching failed"
- Check network tab for `/api/authorizations` request
- Verify JWT token is valid
- Check backend server is running

### "Still getting 403 after granting access"
- Check `is_active = true` in database
- Check `expires_at` is null or in the future
- Verify `shared_key_enc` is not null
- Check backend logs for specific error

### "Authorization badge not showing"
- Check browser console for errors
- Verify `authorizations` query is successful
- Check patient_id matches between queries

## 📝 Next Steps

1. **Immediate**: Grant access manually via database to test file viewing
2. **Short-term**: Implement patient mobile UI for authorization management
3. **Testing**: Test full flow with authorization grant/revoke
4. **Production**: Add notification system when access is granted/revoked

---

**Current Status**: 
- ✅ Backend authorization system complete
- ✅ Doctor web UI showing authorization status
- ⏳ Patient mobile UI pending
- ⏳ Need to grant authorization to test file viewing

**Try this now**: Grant access manually via database, then refresh the doctor web app to see the green badge and test file viewing!
