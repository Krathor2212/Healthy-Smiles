# Fix Remaining Static Data Screens

## Current Status

### ✅ Working (Using AppDataContext)
- **Home Screen** - Shows doctors from backend
- **Find Doctors Screen** - Filters doctors by category
- **Pharmacy Screen** - Ready to show medicines (but database empty)

### ❌ Still Static Data
1. **Chats Screen** - Using hardcoded chat list
2. **Appointments Screen** - Not loading from backend
3. **Payment History** - Using static payment data
4. **Edit Profile** - Not saving to backend

## Steps to Fix

### Step 1: Load Sample Data into Database

Run this command to populate the database:

```bash
cd D:\Healthy-Smiles\Backend
node loadSampleData.js
```

This will load:
- 14 Doctors ✅ (already loaded)
- 5 Medicines 
- 3 Hospitals
- 8 Articles

### Step 2: Create Missing Backend Endpoints

The following endpoints need to be created/verified:

#### A. Appointments Endpoint
**GET /api/appointments**
- Returns user's appointments (upcoming, completed, canceled)
- Already exists in `appointmentController.js`

#### B. Chats Endpoint  
**GET /api/chats**
- Returns user's chat conversations
- Already exists in `chatController.js`

#### C. Payment History Endpoint
**GET /api/payments/history**
- Returns user's payment transactions
- Already exists in `paymentController.js`

#### D. Profile Update Endpoint
**PUT /api/profile**
- Updates user profile (name, phone, height, weight, etc.)
- Already exists in `profileController.js`

### Step 3: Update Frontend Screens

I'll update each screen to fetch from backend instead of using static data:

1. Update **AllChatsScreen.tsx** - Fetch from `/api/chats`
2. Update **AppointmentsScheduleScreen.tsx** - Fetch from `/api/appointments`
3. Update **PaymentHistory.tsx** - Fetch from `/api/payments/history`
4. Update **EditProfile.tsx** - POST to `/api/profile` on save

## Quick Fix Command

Run these commands in order:

```bash
# 1. Load sample data
cd D:\Healthy-Smiles\Backend
node loadSampleData.js

# 2. Restart backend (if not running)
node src/index.js

# 3. In another terminal, restart the app
cd D:\Healthy-Smiles\Medics
npx expo start --clear
```

## Expected Result

After these fixes, you should see:
- ✅ Medicines in Pharmacy screen
- ✅ Real chats from database
- ✅ Real appointments
- ✅ Real payment history
- ✅ Profile updates saved to database

Shall I proceed with updating the frontend screens to use these backend endpoints?
