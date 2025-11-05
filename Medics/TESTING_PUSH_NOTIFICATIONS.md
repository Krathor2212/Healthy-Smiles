# Testing Push Notifications (Polling Method)

## 🧪 Quick Test Guide

### Method 1: Use "Test Backend Notification" Button

1. **Rebuild app with new polling code**:
   ```powershell
   cd D:\Healthy-Smiles\Medics\android
   .\gradlew.bat assembleDebug
   cd app\build\outputs\apk\debug
   adb install -r app-debug.apk
   ```

2. **Open app and login**
   - Polling starts automatically ✅

3. **Go to Profile → "Test Backend Notification"**
   - Backend creates notification in database
   - Within 30 seconds, local notification appears
   - Check notification tray!

---

### Method 2: Test Real Scenarios

#### Test Appointment Notification
1. Create a new appointment
2. Backend automatically creates notification
3. Within 30s, you'll see: "Appointment Confirmed" 🎉

#### Test Order Notification
1. Order medicine from pharmacy
2. Backend creates: "Order Placed Successfully"
3. Notification appears within 30s ✅

#### Test Doctor Message
1. Have a doctor send you a message
2. Backend creates: "New message from Dr. X"
3. Notification appears! 📬

---

## 🔍 Debug Polling

### Check Console Logs

Look for these in your terminal (adb logcat or Expo logs):

```
✅ Good Signs:
📡 Started notification polling (30000ms interval)
📱 App became active, refreshing notifications
📬 New notification detected, triggering local notification

❌ Problems:
Failed to fetch notifications: 401 → Auth token issue
Failed to fetch notifications: 500 → Backend error
Error fetching notifications → Network issue
```

---

## ⏱️ Timing

- **First check**: Immediate (when you login)
- **App active**: Every 30 seconds
- **App background**: Every 60 seconds
- **App closed**: ❌ Doesn't work (need FCM for this)

So if you trigger a backend notification, wait up to **30 seconds** to see it!

---

## 🐛 Troubleshooting

### Notification Not Appearing?

1. **Check backend is running**:
   ```powershell
   cd D:\Healthy-Smiles\Backend
   npm run dev
   ```

2. **Verify notification was created**:
   - Check backend console for: "Push notification sent successfully"
   - Check database: `SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5;`

3. **Wait 30 seconds**:
   - Polling happens every 30s, not instant!

4. **Check app logs**:
   ```powershell
   adb logcat | findstr "notification"
   ```

5. **Verify you're logged in**:
   - Polling only works when authenticated

---

## 📊 Compare: Local vs Polling vs Remote

### Test Notification (Button)
- **Type**: Local notification
- **Trigger**: Manual button press
- **Delay**: Instant ⚡
- **Works**: Always

### Polling Notification (NEW!)
- **Type**: Local notification triggered by polling
- **Trigger**: Backend creates notification
- **Delay**: Up to 30 seconds ⏱️
- **Works**: When app is open/background

### Remote Push (FCM)
- **Type**: Remote push notification
- **Trigger**: Backend → FCM → Device
- **Delay**: Instant ⚡
- **Works**: Even when app is closed
- **Requires**: FCM Server Key setup ❌

---

## ✅ Success Criteria

After rebuilding, you should see:

1. **Login** → Console shows: "Started notification polling"
2. **Create notification** → Backend saves to DB
3. **Wait 30s** → Local notification appears
4. **Open notification** → Takes you to correct screen
5. **Badge count** → Updates automatically

---

## 🎯 Real-World Test Flow

```bash
# Terminal 1: Start backend
cd D:\Healthy-Smiles\Backend
npm run dev

# Terminal 2: Watch app logs
adb logcat | findstr "📡|📬|notification"

# Terminal 3: Rebuild and install app
cd D:\Healthy-Smiles\Medics\android
.\gradlew.bat assembleDebug
cd app\build\outputs\apk\debug
adb install -r app-debug.apk
```

Then:
1. Open app, login
2. Go to Profile → "Test Backend Notification"
3. Watch Terminal 2 for polling logs
4. Within 30s → Notification appears! 🎉

---

## 💡 Pro Tips

- **Faster testing**: Reduce polling interval temporarily
  ```typescript
  // In NotificationPollingContext.tsx
  const POLLING_INTERVAL = 5000; // 5 seconds for testing
  ```

- **Background testing**: 
  1. Send notification from backend
  2. Press home button (app goes to background)
  3. Notification still appears within 60s!

- **Network testing**:
  - Turn off WiFi → Polling stops
  - Turn on WiFi → Polling resumes automatically

---

## 📝 Next Steps

1. ✅ Rebuild app with polling code
2. ✅ Test "Test Backend Notification" button
3. ✅ Test real scenarios (appointments, orders, messages)
4. ✅ Verify notifications appear within 30s
5. 🎉 Push notifications working!

**No FCM Server Key needed!** 🚀
