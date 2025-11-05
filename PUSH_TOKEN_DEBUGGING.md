# 🐛 Push Token Debugging Guide

## Issue: "No push token found for patient"

This means the backend doesn't have your device's push token saved in the database.

---

## ✅ Quick Fix Steps

### 1. **Rebuild the App** (Latest changes include auto-retry)
```powershell
cd D:\Healthy-Smiles\Medics\android
.\gradlew.bat assembleDebug
```

### 2. **Fresh Install**
1. Uninstall old version from device
2. Install new APK
3. Login to your account

### 3. **Check Console Logs**

When you login, you should see:
```
✅ Login successful, fetching app data...
📱 Registering push token after login...
📱 Push token received: ExponentPushToken[xxxxxxxxx]
🔄 Sending push token to backend...
✅ Push token registered with backend: Push token saved successfully
```

If you don't see these logs, try step 4.

### 4. **Manual Push Token Registration**

In the app:
1. Go to **Profile** screen
2. Tap **"Register Push Token"**
3. You should see success message

This will manually send your push token to the backend.

### 5. **Verify in Database**

Check if the token was saved:
```sql
-- Connect to PostgreSQL
psql -U postgres -d healthy_smiles

-- Check your push token
SELECT id, email_hmac, push_token 
FROM patients 
WHERE id = '49607d6a-7bbb-41c9-971e-8fbaea9a514f';
```

If `push_token` is NULL, the registration failed.

---

## 🔍 Detailed Debugging

### Check 1: Is the App Getting a Push Token?

**Mobile app console:**
Look for:
```
📱 Push token received: ExponentPushToken[xxxxx]
```

**If you see**: "⚠️ No push token obtained from device"
- Problem: Expo can't get push token from device
- Solutions:
  - Use a **physical device** (emulators may not work)
  - Check internet connection
  - Restart the app
  - Check notification permissions

### Check 2: Is the Token Being Sent to Backend?

**Mobile app console:**
Look for:
```
🔄 Sending push token to backend...
✅ Push token registered with backend: Push token saved successfully
```

**If you see**: "No auth token, skipping push token registration"
- Problem: App hasn't logged in yet
- Solution: Wait a moment, there's an auto-retry mechanism now
- Or manually tap "Register Push Token" in Profile

**If you see**: "Failed to register push token with backend: 401"
- Problem: Auth token invalid or expired
- Solution: Logout and login again

**If you see**: "Failed to register push token with backend: 404"
- Problem: Backend endpoint not found
- Solution: Make sure backend is running with latest code

### Check 3: Is the Backend Saving the Token?

**Backend logs** (http://10.11.146.215:4000/logs.html):
Look for:
```
POST /api/auth/push-token 200 [response time]
```

**If you see 401 error:**
- Auth token is invalid
- User needs to login again

**If you see 500 error:**
- Database error
- Check backend console for stack trace

### Check 4: Database Check

```sql
-- See all tokens
SELECT id, push_token 
FROM patients 
WHERE push_token IS NOT NULL;

-- Check specific user
SELECT * FROM patients WHERE id = '49607d6a-7bbb-41c9-971e-8fbaea9a514f';
```

**If push_token is NULL:**
- Token never made it to the database
- Check backend endpoint is working
- Try manual registration button

**If push_token is not NULL:**
- Token is saved! ✅
- The "No push token found" error shouldn't happen
- Try logging out and back in

---

## 🔧 New Features Added

### 1. **Auto-Retry Mechanism**
The app now automatically retries sending the push token every 5 seconds for the first minute after app startup. This handles cases where the token is obtained before login.

### 2. **Login Integration**
Push token is now automatically registered immediately after successful login.

### 3. **Manual Registration Button**
New "Register Push Token" button in Profile screen for manual registration.

### 4. **Enhanced Logging**
More detailed console logs to track the push token lifecycle:
- 📱 Token received from device
- 🔄 Sending to backend
- ✅ Successfully registered
- ⚠️ Warnings and errors

---

## 📊 Test Flow

### Expected Flow:
```
1. App starts
   ↓
2. Get push token from Expo
   📱 Push token received: ExponentPushToken[xxx]
   ↓
3. Auto-retry starts (checks every 5 seconds)
   ↓
4. User logs in
   ↓
5. Token sent to backend immediately
   🔄 Sending push token to backend...
   ↓
6. Backend saves token
   ✅ Push token registered with backend
   ↓
7. Test backend notification
   POST /api/notifications/test
   ↓
8. Notification appears! 🎉
```

---

## 🚨 Common Issues

### Issue: "No push token obtained from device"
**Cause**: Emulator or device doesn't support push notifications
**Fix**: Use a physical Android/iOS device

### Issue: "No auth token, skipping push token registration"
**Cause**: Token obtained before login
**Fix**: Wait for auto-retry, or tap "Register Push Token" after login

### Issue: Token saved but still "No push token found"
**Cause**: Wrong user ID or database query issue
**Fix**: 
```sql
-- Check if token exists
SELECT id, push_token FROM patients WHERE push_token IS NOT NULL;

-- Update manually if needed
UPDATE patients 
SET push_token = 'ExponentPushToken[xxx]' 
WHERE id = '49607d6a-7bbb-41c9-971e-8fbaea9a514f';
```

### Issue: Notifications work locally but not from backend
**Cause**: Token format issue or Expo API error
**Fix**: Check backend logs for Expo API response errors

---

## ✅ Verification Checklist

- [ ] App shows "📱 Push token received"
- [ ] App shows "✅ Push token registered with backend"
- [ ] Database has push_token value (not NULL)
- [ ] Backend test notification works
- [ ] Real event notifications work (appointment/order/message)

---

## 🆘 Still Not Working?

1. **Check backend is running**: http://10.11.146.215:4000
2. **Check backend logs**: http://10.11.146.215:4000/logs.html
3. **Verify migration ran**: `SELECT column_name FROM information_schema.columns WHERE table_name='patients' AND column_name='push_token';`
4. **Try fresh install**: Uninstall app, clear cache, reinstall
5. **Check permissions**: Settings → Apps → Healthy Smiles → Notifications (must be ON)

---

**Files Changed:**
- `app/contexts/NotificationContext.tsx` - Auto-retry + manual registration
- `app/Login/Login.tsx` - Register token after login
- `app/Pages/Profile/Profile.tsx` - Manual registration button
