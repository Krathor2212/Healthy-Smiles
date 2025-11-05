# Firebase Setup for Push Notifications

## ⚠️ Current Issue
Your app needs Firebase Cloud Messaging (FCM) to send push notifications on Android standalone APK builds.

**Error**: "Default FirebaseApp is not initialized"

---

## 🔧 Quick Fix Options

### Option 1: Use Expo's Built-in Push Service (Recommended for Testing)

For development and testing, you can use Expo's push notification service without Firebase:

**This requires building with EAS Build instead of local APK:**

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for Android
eas build --platform android --profile preview
```

The EAS build will handle FCM automatically!

---

### Option 2: Set Up Firebase (For Production APK)

If you want to continue using local APK builds (`gradlew assembleDebug`), you need to set up Firebase:

#### **Step 1: Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Project name: **Healthy-Smiles** (or any name)
4. Disable Google Analytics (optional)
5. Click "Create Project"

#### **Step 2: Add Android App**

1. In Firebase Console, click "Add app" → Android icon
2. Android package name: `com.purushothaman2212.Medics`
3. App nickname: **Medics** (optional)
4. Click "Register app"

#### **Step 3: Download google-services.json**

1. Click "Download google-services.json"
2. **Replace** the dummy file at: `d:\Healthy-Smiles\Medics\google-services.json`
3. Make sure it contains YOUR actual Firebase credentials

#### **Step 4: Rebuild the App**

```powershell
cd D:\Healthy-Smiles\Medics\android
.\gradlew.bat assembleDebug
```

#### **Step 5: Test Push Notifications**

1. Install new APK
2. Login to app
3. Go to Profile → "Force Get Push Token"
4. You should now get: `ExponentPushToken[xxxxx]` ✅

---

### Option 3: Use Local Notifications Only (No Backend Push)

If you only need local notifications (triggered from within the app):

The **"Test Notification"** button already works! This doesn't require Firebase or backend.

For backend notifications, you'll need Option 1 or 2.

---

## 📋 Current Setup Status

- ✅ Expo notifications package installed
- ✅ Android permissions configured
- ✅ Notification channel set up
- ⚠️ **Missing**: Real Firebase `google-services.json`
- ⚠️ **Temporary**: Dummy Google Services file (won't work for push)

---

## 🎯 Recommended Next Steps

### For Testing Right Now:
1. **Use local notifications** (Test Notification button works!)
2. Backend notifications won't work until Firebase is set up

### For Full Push Notification Support:
1. **Best**: Use EAS Build (Option 1) - Handles everything automatically
2. **Alternative**: Set up Firebase manually (Option 2) - More complex but works with local builds

---

## 🔍 Why This Happened

- **Expo Go / Development**: Uses Expo's servers, no Firebase needed
- **Standalone APK**: Needs FCM (Firebase Cloud Messaging) for push notifications
- **EAS Build**: Automatically configures FCM for you
- **Local APK Build**: Requires manual Firebase setup

---

## ⚡ Quick Test (Without Backend Push)

You can still test notifications locally:

1. Open app
2. Go to Profile
3. Tap "Test Notification"
4. ✅ Notification appears immediately!

This proves the notification system works - you just need Firebase for **backend-initiated** push notifications.

---

## 📞 Need Help?

**Option 1 (EAS Build)**: https://docs.expo.dev/build/introduction/
**Option 2 (Firebase)**: https://docs.expo.dev/push-notifications/fcm-credentials/

---

**Current file status:**
- `google-services.json` - ⚠️ Dummy file (replace with real one from Firebase Console)
- `app.json` - ✅ Configured to use google-services.json
