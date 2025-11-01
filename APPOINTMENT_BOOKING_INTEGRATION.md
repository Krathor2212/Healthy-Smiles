# Appointment Booking - Database Integration ✅

## Summary
Successfully integrated appointment booking with backend database. Now when users book an appointment, it gets saved to the PostgreSQL database and can be viewed in the Appointments screen.

---

## Changes Made

### 1. **Appointment.tsx** - Booking Screen
**Location:** `Medics/app/Pages/Doctors/Appointment.tsx`

**Added:**
- ✅ Import `AsyncStorage` for JWT token
- ✅ Import `Constants` for backend URL
- ✅ Added `booking` state to track loading
- ✅ Added `doctorId` to appointment data
- ✅ Implemented `handleBooking()` async function with API call
- ✅ Added `formatDateForBackend()` helper to convert date format
- ✅ Added loading spinner on booking button during submission
- ✅ Added proper error handling (401, network errors)
- ✅ Navigate to Profile after successful booking

**API Call:**
```typescript
POST /api/appointments
Headers: Authorization: Bearer <token>
Body: {
  doctorId: string,
  date: "YYYY-MM-DD",
  time: "HH:MM AM/PM",
  reason: string,
  payment: {
    consultation: 500.00,
    adminFee: 50.00,
    discount: 0,
    total: 550.00,
    currency: "₹",
    paymentMethod: "VISA",
    isPaid: false
  }
}
```

**Flow:**
1. User confirms booking in Alert dialog
2. Retrieves JWT token from AsyncStorage
3. Formats date from "Wednesday, Jun 23, 2021" to "2021-06-23"
4. Sends POST request to `/api/appointments`
5. Shows success alert on 200 response
6. Navigates to Profile page
7. Shows error alert on failure

---

### 2. **DoctorDetails.tsx** - Doctor Profile Screen
**Location:** `Medics/app/Pages/Doctors/DoctorDetails.tsx`

**Changed:**
- ✅ Added `doctorId` to navigation params when booking appointment

**Before:**
```typescript
navigation.navigate("Appointment", {
  doctorName: doctorData.name,
  specialty: doctorData.specialty,
  // ... other params
});
```

**After:**
```typescript
navigation.navigate("Appointment", {
  doctorId: doctorData.id,  // ✅ Added this
  doctorName: doctorData.name,
  specialty: doctorData.specialty,
  // ... other params
});
```

---

### 3. **Navigation Types** - Type Definitions
**Location:** `Medics/app/Navigation/types.ts`

**Updated:**
```typescript
Appointment: {
  doctorId?: string;        // ✅ Added this field
  doctorName?: string;
  specialty?: string;
  rating?: string;
  distance?: string;
  image?: string;
  date?: string;
  time?: string;
  reason?: string;
} | undefined;
```

---

## Backend Integration

### Endpoint: `POST /api/appointments`

**Controller:** `Backend/src/controllers/appointmentController.js`

**What it does:**
1. Validates required fields (doctorId, date, time, payment)
2. Fetches doctor details from `doctors_data` table
3. Fetches hospital details if available
4. Encrypts the appointment reason
5. Generates unique appointment ID (UUID)
6. Generates transaction ID
7. Saves appointment to `appointments` table with status "Confirmed"
8. Creates notification for the user
9. Returns success response with appointment data

**Database Table: `appointments`**
```sql
- id (UUID)
- patient_id (references patients)
- doctor_id (references doctors_data)
- doctor_name (encrypted)
- doctor_image (URL)
- specialty (text)
- appointment_date (date)
- appointment_time (time)
- reason_enc (encrypted text)
- status (Confirmed/Completed/Canceled)
- hospital_name (text)
- hospital_address (text)
- payment (JSONB)
- created_at (timestamp)
```

---

## User Experience Flow

### Before Changes ❌
1. User selects date/time on DoctorDetails screen
2. Clicks "Book Appointment"
3. Navigates to Appointment screen
4. Reviews details and clicks "Booking" button
5. ⚠️ **Just shows success alert - no database save**
6. Navigate to Home
7. ⚠️ **Appointment is lost - doesn't appear in Appointments screen**

### After Changes ✅
1. User selects date/time on DoctorDetails screen
2. Clicks "Book Appointment"
3. Navigates to Appointment screen
4. Reviews details and clicks "Booking" button
5. ✅ **Shows loading spinner**
6. ✅ **Sends API request to backend**
7. ✅ **Appointment saved to database**
8. ✅ **Shows success alert**
9. Navigate to Profile
10. ✅ **User can see appointment in "Appointments Schedule" section**
11. ✅ **Appointment appears with "Confirmed" status**

---

## Features

### ✅ **Authentication**
- Uses JWT token from AsyncStorage
- Includes `Authorization: Bearer <token>` header
- Handles 401 errors (redirects to Login)

### ✅ **Loading States**
- Booking button shows spinner during API call
- Button disabled to prevent double-booking
- Opacity reduced to show disabled state

### ✅ **Error Handling**
```typescript
try {
  // API call
} catch (error) {
  // Network error
  Alert.alert('Error', 'Please check your connection');
} finally {
  setBooking(false); // Always reset loading state
}
```

### ✅ **Date Formatting**
- Converts "Wednesday, Jun 23, 2021" → "2021-06-23"
- Fallback to current date if parsing fails
- Compatible with backend date column type

### ✅ **Payment Integration**
- Sends detailed payment object
- Includes consultation fee, admin fee, discount
- Stores payment method (VISA, etc.)
- Marks as unpaid initially (can be updated later)

---

## Testing Checklist

### Prerequisites
- [ ] Backend server running on configured URL
- [ ] User logged in with valid JWT token
- [ ] Doctor data exists in database

### Test Steps

1. **Navigate to Find Doctors**
   - [ ] See list of doctors
   - [ ] Click on any doctor

2. **Doctor Details Screen**
   - [ ] See doctor profile and available time slots
   - [ ] Select a date from calendar
   - [ ] Select a time slot
   - [ ] Click "Book Appointment" button

3. **Appointment Screen**
   - [ ] See correct doctor name, specialty
   - [ ] See correct selected date and time
   - [ ] See reason "General Consultation"
   - [ ] Click "Change" to update reason
   - [ ] See payment details (₹550.00 total)

4. **Book Appointment**
   - [ ] Click "Booking" button
   - [ ] See confirmation dialog
   - [ ] Click "Confirm Booking"
   - [ ] See loading spinner on button
   - [ ] See success alert "Appointment booked successfully!"
   - [ ] Click OK on alert
   - [ ] Navigate to Profile screen

5. **Verify in Database**
   - [ ] Open pgAdmin or database client
   - [ ] Query: `SELECT * FROM appointments ORDER BY created_at DESC LIMIT 1;`
   - [ ] Verify appointment exists with:
     - Correct patient_id
     - Correct doctor_id
     - Correct date and time
     - Status = 'Confirmed'
     - Encrypted reason
     - Payment JSON object

6. **View in App**
   - [ ] On Profile screen, click "Appointments Schedule"
   - [ ] Navigate to Appointments screen
   - [ ] See "Upcoming" tab
   - [ ] Verify new appointment appears in list
   - [ ] Check doctor name, date, time are correct
   - [ ] Status shows "Confirmed" with green badge

7. **Error Scenarios**
   - [ ] Turn off wifi → Try booking → See error message
   - [ ] Logout → Try booking → Redirect to Login
   - [ ] Invalid doctorId → See "Doctor not found" error

---

## Data Flow Diagram

```
User Interface              Frontend                Backend              Database
─────────────              ────────                ───────              ────────
┌──────────┐
│ Doctor   │ Select Date
│ Details  │ Select Time     ┌────────────┐
│ Screen   │────────────────>│            │
└──────────┘                 │            │
                             │            │
┌──────────┐                 │ Appoint-   │
│ Appoint- │ Review Details  │ ment       │
│ ment     │ Click "Booking" │ Screen     │
│ Screen   │────────────────>│            │
└──────────┘                 │            │
                             │            │
                             │ POST       │       ┌─────────────┐
                             │ /api/      │       │ Appointment │
                             │ appoint-   │───────│ Controller  │
                             │ ments      │       └─────────────┘
                             │            │              │
                             │            │              │ Validate
                             │            │              │ Get Doctor
                             │            │              │ Get Hospital
                             │            │              │ Encrypt Reason
                             │            │              │
                             │            │              v
                             │            │       ┌──────────────┐
                             │            │       │ PostgreSQL   │
                             │   Success  │<──────│ INSERT INTO  │
                             │   Response │       │ appointments │
                             │            │       └──────────────┘
                             │            │
┌──────────┐                 │            │
│ Success  │<────────────────│            │
│ Alert    │  Navigate to    └────────────┘
│          │  Profile
└──────────┘

┌──────────┐                ┌────────────┐
│ Appoint- │ GET /api/      │ Appoint-   │       ┌──────────────┐
│ ments    │ appointments   │ ment       │───────│ PostgreSQL   │
│ Screen   │───────────────>│ Controller │       │ SELECT FROM  │
│          │                │            │<──────│ appointments │
│ Shows    │<───────────────│            │       └──────────────┘
│ Booked   │  Appointments  └────────────┘
└──────────┘
```

---

## Security Features

### 🔒 **Data Encryption**
- Appointment reason is encrypted before saving
- Uses `encryptText()` from `cryptoUtil.js`
- AES-256-GCM encryption

### 🔒 **Authentication**
- JWT token required for all appointment operations
- Token validated on every request
- Expired tokens handled gracefully

### 🔒 **Authorization**
- Users can only create appointments for themselves
- Patient ID extracted from JWT token (cannot be spoofed)
- Users can only view their own appointments

### 🔒 **Input Validation**
- Required fields checked on backend
- Doctor ID validated (must exist in database)
- Date format validated
- SQL injection prevented (parameterized queries)

---

## Next Steps (Optional Enhancements)

### 1. **Payment Processing**
- [ ] Integrate real payment gateway (Razorpay, Stripe)
- [ ] Update `isPaid` flag after successful payment
- [ ] Send payment confirmation email

### 2. **Appointment Reminders**
- [ ] Send push notification 24 hours before appointment
- [ ] Send SMS reminder 1 hour before appointment
- [ ] Email confirmation immediately after booking

### 3. **Calendar Sync**
- [ ] Add to Google Calendar
- [ ] Add to Apple Calendar
- [ ] Generate .ics file for download

### 4. **Doctor Availability**
- [ ] Check real-time doctor availability
- [ ] Block booked time slots
- [ ] Show "Fully Booked" when no slots available

### 5. **Appointment Management**
- [ ] Reschedule appointment (change date/time)
- [ ] Cancel with refund processing
- [ ] Request appointment change from doctor side

---

## Files Modified

```
✅ Medics/app/Pages/Doctors/Appointment.tsx
✅ Medics/app/Pages/Doctors/DoctorDetails.tsx
✅ Medics/app/Navigation/types.ts
```

**Backend (already existed):**
```
✅ Backend/src/controllers/appointmentController.js
✅ Backend/src/routes/appointments.js
✅ Backend/db/schema.sql (appointments table)
```

---

## Database Schema

### `appointments` Table
```sql
CREATE TABLE appointments (
    id UUID PRIMARY KEY,
    patient_id UUID REFERENCES patients(id),
    doctor_id UUID REFERENCES doctors_data(id),
    doctor_name VARCHAR(255),
    doctor_image TEXT,
    specialty VARCHAR(100),
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(20) NOT NULL,
    reason_enc TEXT,
    status VARCHAR(20) DEFAULT 'Confirmed',
    hospital_name VARCHAR(255),
    hospital_address TEXT,
    payment JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

**Integration completed successfully! ✅**

Users can now:
1. Book appointments through the app
2. Appointments are saved to the database
3. View their appointments in the Appointments screen
4. Cancel or mark appointments as complete
5. See payment history for appointments

*Last updated: November 1, 2025*
