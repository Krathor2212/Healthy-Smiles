# Get FCM Server Key for Expo Push Notifications

## 🎯 Problem
Error: "Unable to retrieve the FCM server key for the recipient's app"

Your app now has a push token (`ExponentPushToken[NIv9CsLC97IMuuWMyoYLLJ...]`), but Expo can't send notifications because it doesn't have your Firebase Cloud Messaging credentials.

---

## 📋 Get FCM Server Key from Firebase

### Step 1: Go to Firebase Console
1. Open https://console.firebase.google.com/
2. Select your project: **medics-f19d4**

### Step 2: Navigate to Cloud Messaging
1. Click the **gear icon** (Settings) → **Project settings**
2. Go to the **Cloud Messaging** tab
3. Scroll to **Cloud Messaging API (Legacy)**

### Step 3: Get Server Key
1. Look for **Server key**
2. Copy the key (starts with `AAAA...`)

**⚠️ If you don't see a Server Key:**
- Cloud Messaging API (Legacy) might be disabled
- You'll need to enable it in Google Cloud Console
- Or use the newer FCM v1 API (more complex setup)

---

## 🔑 Upload Server Key to Expo

### Option A: Using Expo CLI (Recommended)

```powershell
# Install Expo CLI if not already installed
npm install -g expo-cli

# Login to Expo
expo login

# Navigate to your project
cd D:\Healthy-Smiles\Medics

# Upload FCM credentials
expo push:android:upload --api-key YOUR_FCM_SERVER_KEY_HERE
```

Replace `YOUR_FCM_SERVER_KEY_HERE` with the Server Key you copied from Firebase.

---

### Option B: Using Expo Website

1. Go to https://expo.dev/
2. Login with account: **purushothaman2212**
3. Click on project: **Medics** (Project ID: `bd1006c0-e233-439d-bda0-2d57c5639218`)
4. Go to **Credentials**
5. Under **Android** → **FCM Server Key**
6. Paste your Firebase Server Key
7. Save

---

## ✅ Test After Setup

Once the FCM Server Key is uploaded:

1. **In your app**: Go to Profile → "Test Backend Notification"
2. **You should see**: Notification appears on your device! 🎉
3. **Check backend logs**: Should show "Push notification sent successfully"

---

## 🔍 Alternative: Enable FCM API (Legacy)

If you don't see the Server Key in Firebase:

### Step 1: Enable Cloud Messaging API
1. Go to https://console.cloud.google.com/
2. Select project: **medics-f19d4**
3. Go to **APIs & Services** → **Library**
4. Search for "**Cloud Messaging**"
5. Click "**Firebase Cloud Messaging API**"
6. Click **Enable**

### Step 2: Get Credentials
1. Go back to Firebase Console
2. Project Settings → Cloud Messaging tab
3. Server Key should now be visible

---

## 📱 Current Status

✅ **Mobile App**: Push token successfully retrieved
✅ **Firebase**: Project created and configured
✅ **google-services.json**: Real credentials in place
❌ **Expo**: Needs FCM Server Key to send notifications

**Next Step**: Upload FCM Server Key to Expo using one of the methods above.

---

## 🎯 Quick Command

```powershell
expo push:android:upload --api-key [PASTE_YOUR_FCM_KEY_HERE]
```

After this, your push notifications will work end-to-end! 🚀
