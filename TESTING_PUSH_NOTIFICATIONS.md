# Push Notifications Testing Guide

## ✅ Setup Complete!

The following has been implemented:

### Backend Changes:
1. **Push token storage** - `patients.push_token` column added
2. **Push notification sending** - `createNotification()` sends to Expo API
3. **Test endpoint** - `POST /api/notifications/test`
4. **Token registration** - `POST /api/auth/push-token`

### Mobile App Changes:
1. **Push token registration** - NotificationContext sends token to backend
2. **Test buttons** - Profile screen has both local and backend notification tests
3. **Notification handling** - Listens for incoming push notifications

### Events with Push Notifications:
✅ Appointment bookings
✅ Order placements
✅ Doctor messages

---

## 🧪 Testing Steps

### Step 1: Run Database Migration

The migration has already been run successfully! The `push_token` column has been added to the `patients` table.

### Step 2: Restart Backend Server

Make sure your backend server is running with the latest code:

```bash
cd D:\Healthy-Smiles\Backend
node src/index.js
```

You should see:
```
✅ Server started on http://192.168.137.1:4000
📊 Log Dashboard: http://192.168.137.1:4000/logs.html
```

### Step 3: Rebuild Mobile App

The mobile app needs to be rebuilt to include the updated code:

```bash
cd D:\Healthy-Smiles\Medics\android
.\gradlew.bat assembleDebug
```

Or build APK from VS Code terminal:
```powershell
cd D:\Healthy-Smiles\Medics
npm run android
```

### Step 4: Install and Login

1. Install the new APK on your device
2. Login to your account
3. Grant notification permissions when prompted

**What happens during login:**
- App gets Expo push token from device
- App sends token to backend via `POST /api/auth/push-token`
- Backend saves token in `patients.push_token` column
- Check backend logs to confirm: "✅ Push token registered with backend"

### Step 5: Test Local Notification (Baseline)

This confirms your device can show notifications:

1. Open Profile screen
2. Tap "Test Notification"
3. You should see a notification in your system tray immediately

**Expected:**
- ✅ Notification appears
- ✅ Title: "Test Notification 📬"
- ✅ Body: "This is a test notification..."

If this fails, check:
- Notification permissions in device settings
- App has POST_NOTIFICATIONS permission

### Step 6: Test Backend Push Notification

This tests the full push notification flow:

1. Open Profile screen
2. Tap "Test Backend Notification"
3. Wait 2-3 seconds
4. You should see a notification from the backend

**Expected:**
- ✅ Success alert appears
- ✅ Notification arrives within 2-3 seconds
- ✅ Title: "Test Notification from Backend"
- ✅ Body: "This is a test notification from the Healthy Smiles backend!"

**Check backend logs:**
- Open http://192.168.137.1:4000/logs.html
- You should see:
  - "Push notification sent successfully to patient: [your-id]"
  - Or error if token is invalid/missing

**If notification doesn't appear:**
1. Check backend logs for errors
2. Verify push token was saved:
   ```sql
   SELECT id, push_token FROM patients WHERE id = 'your-user-id';
   ```
3. Check if token is valid (starts with "ExponentPushToken[")
4. Make sure you're using a physical device (emulators may not work)

### Step 7: Test Real Events

#### Test Appointment Notification:
1. Book an appointment through the app
2. You should receive a push notification:
   - Title: "Appointment Confirmed"
   - Body: "Your appointment with Dr. [Name] is confirmed for [date] at [time]."
   - Icon color: Green (#34D399)

#### Test Order Notification:
1. Place a medicine order
2. You should receive a push notification:
   - Title: "Order Placed Successfully"
   - Body: "Your order [order-number] has been placed and is being processed."
   - Icon color: Green (#34D399)

#### Test Message Notification:
1. Have a doctor send you a message
2. You should receive a push notification:
   - Title: "New message from Dr. [Name]"
   - Body: [First 100 characters of message]
   - Icon color: Purple (#8B5CF6)

---

## 🔍 Debugging

### Check Push Token Registration

**Backend logs (http://192.168.137.1:4000/logs.html):**
Look for:
```
✅ Push token registered with backend: Push token saved successfully
```

**Database check:**
```bash
# Connect to PostgreSQL
psql -U postgres -d healthy_smiles

# Check if your token is saved
SELECT email_hmac, push_token FROM patients WHERE push_token IS NOT NULL;
```

### Check Notification Sending

**Backend logs:**
```
Push notification sent successfully to patient: [uuid]
```

Or errors:
```
Push notification error: DeviceNotRegistered
Push notification error: InvalidCredentials
```

### Common Issues

**1. "No push token found for patient"**
- User hasn't logged in after update
- Token registration failed
- Check mobile app logs for errors

**2. "DeviceNotRegistered"**
- Push token expired or invalid
- User uninstalled and reinstalled app
- Solution: Logout and login again

**3. Notification not appearing**
- Check device notification settings
- Check app has POST_NOTIFICATIONS permission
- Try local test notification first
- Physical device vs emulator (use physical)

**4. "Failed to register push token with backend: 401"**
- Auth token invalid or expired
- User needs to login again

---

## 📊 Monitor with Log Dashboard

Open http://192.168.137.1:4000/logs.html to see real-time:
- HTTP requests
- Database queries
- Encryption operations
- Errors

Filter by:
- "notification" to see notification operations
- "push-token" to see token registration
- "error" to see issues

---

## 🎯 Success Criteria

✅ Local notification works (proves device can show notifications)
✅ Backend test notification works (proves full flow functional)
✅ Appointment booking sends push notification
✅ Order placement sends push notification
✅ Doctor message sends push notification
✅ Push token saved in database
✅ No errors in backend logs

---

## 📝 Next Steps

Once all tests pass:

1. **Add more notification types:**
   - Payment confirmations
   - Prescription updates
   - Appointment reminders (scheduled)
   
2. **Implement notification actions:**
   - Quick reply to messages
   - Cancel appointment from notification
   
3. **Add notification preferences:**
   - Let users choose which notifications to receive
   - Quiet hours settings
   
4. **Analytics:**
   - Track notification open rates
   - A/B test notification content

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Test on multiple devices
- [ ] Test with multiple users
- [ ] Handle Expo push token errors gracefully
- [ ] Implement token refresh logic
- [ ] Add rate limiting to prevent notification spam
- [ ] Test notification delivery during:
  - [ ] App in foreground
  - [ ] App in background
  - [ ] App completely closed
  - [ ] Device locked
- [ ] Monitor Expo push notification quota
- [ ] Set up error alerting for failed notifications

---

## 📞 Support

If notifications still don't work after following this guide:

1. Check backend logs: http://192.168.137.1:4000/logs.html
2. Check mobile app console logs
3. Verify database has push_token saved
4. Try logout/login to re-register token
5. Test on a different device
6. Check Expo push notification status

**Files to check:**
- Backend: `src/controllers/notificationController.js`
- Mobile: `app/contexts/NotificationContext.tsx`
- Migration: `db/add_push_token_migration.sql`
