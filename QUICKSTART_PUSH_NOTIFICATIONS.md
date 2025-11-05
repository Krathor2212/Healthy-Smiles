# 🚀 Quick Start - Push Notifications

## ⚡ 3-Step Setup

### 1️⃣ Ensure Backend is Running
```bash
cd D:\Healthy-Smiles\Backend
node src/index.js
```
✅ Look for: "Server started on http://192.168.137.1:4000"

### 2️⃣ Rebuild Mobile App
```bash
cd D:\Healthy-Smiles\Medics\android
.\gradlew.bat assembleDebug
```
✅ APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### 3️⃣ Test on Device
1. Install APK
2. Login to app
3. Open Profile → Tap "Test Backend Notification"
4. ✅ You should see a notification!

---

## 🧪 Quick Tests

### Test 1: Local Notification (Baseline)
**Profile → Test Notification**
- Proves device can show notifications
- If this fails → Check device permissions

### Test 2: Backend Notification
**Profile → Test Backend Notification**
- Proves full backend → device flow works
- If this fails → Check backend logs at http://192.168.137.1:4000/logs.html

### Test 3: Real Event
**Book an appointment**
- Should receive "Appointment Confirmed" notification
- If this fails → Check both tests above work first

---

## 📊 Monitor Everything

**Backend Logs**: http://192.168.137.1:4000/logs.html

Look for:
- ✅ "Push token registered with backend"
- ✅ "Push notification sent successfully"
- ❌ Any errors

---

## 🐛 Quick Troubleshooting

**No notification appearing?**
1. Check local test notification works first
2. Check backend logs for errors
3. Verify you're on a physical device (not emulator)
4. Try logout → login to re-register token

**"No push token found"?**
1. Logout and login again
2. Check backend logs for "Push token registered"
3. Check database: `SELECT push_token FROM patients WHERE id = 'your-id'`

---

## 📝 Quick Reference

**Test Endpoint**: `POST http://192.168.137.1:4000/api/notifications/test`
**Save Token**: `POST http://192.168.137.1:4000/api/auth/push-token`
**Log Dashboard**: http://192.168.137.1:4000/logs.html

**Events that send notifications:**
- ✅ Appointment bookings
- ✅ Order placements  
- ✅ Doctor messages

---

## 🎯 Expected Results

### After Login:
```
Console: "✅ Push token registered with backend: Push token saved successfully"
```

### After "Test Backend Notification":
```
Alert: "Success - Backend push notification sent!"
Notification appears: "Test Notification from Backend"
Backend logs: "Push notification sent successfully to patient: [uuid]"
```

### After Booking Appointment:
```
Notification: "Appointment Confirmed"
Description: "Your appointment with Dr. [Name] is confirmed..."
```

---

**Need more help?** See:
- Full guide: `TESTING_PUSH_NOTIFICATIONS.md`
- Implementation details: `Backend/PUSH_NOTIFICATIONS.md`
- Summary: `PUSH_NOTIFICATIONS_SUMMARY.md`
