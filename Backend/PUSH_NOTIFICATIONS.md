# Backend Push Notifications Implementation

## Overview
This document outlines the implementation of push notifications from the backend to the mobile app. The system now supports sending push notifications when events occur (appointments, orders, messages, etc.).

## What Was Added

### 1. Database Changes
- **Added Column**: `push_token` to `patients` table
- **Index**: Created index on `push_token` for faster lookups
- **Migration File**: `db/add_push_token_migration.sql`

### 2. Backend Endpoints

#### Save Push Token
```
POST /api/auth/push-token
Authorization: Bearer <token>
Body: { "pushToken": "ExponentPushToken[...]" }
```
Saves the user's Expo push token to the database.

#### Test Notification
```
POST /api/notifications/test
Authorization: Bearer <token>
```
Sends a test push notification to the authenticated user.

#### Migration Endpoint
```
POST /api/migration/migrate-push-token
```
Runs the database migration to add the push_token column.

### 3. New Functions

#### `createNotification(userId, notificationData)`
**File**: `src/controllers/notificationController.js`
```javascript
await createNotification(userId, {
  title: 'Appointment Confirmed',
  description: 'Your appointment with Dr. Smith is confirmed for tomorrow at 2 PM',
  type: 'appointment',
  iconName: 'calendar',
  iconColor: '#34D399',
  relatedId: appointmentId
});
```
- Stores notification in PostgreSQL
- Automatically sends push notification to user's device
- Returns the created notification object

#### `sendPushNotification(userId, notification)`
**File**: `src/controllers/notificationController.js`
- Fetches user's push token from database
- Sends notification via Expo Push API
- Handles errors gracefully (doesn't fail if token is missing)

## Testing Instructions

### Step 1: Run the Migration
You need to add the `push_token` column to the `patients` table. You can do this in two ways:

**Option A: Using the migration endpoint (Recommended)**
1. Make sure your backend is running
2. Send a POST request to the migration endpoint:
```bash
curl -X POST http://192.168.137.1:4000/api/migration/migrate-push-token
```

**Option B: Run the migration script directly**
```bash
cd Backend
node runMigration.js
```

You should see:
```
✓ Added push_token column to patients table
✓ Created index on push_token column
✓ Added column comment
✅ Migration completed successfully!
```

### Step 2: Update Mobile App to Send Push Token

The mobile app needs to send its push token to the backend. This typically happens when the app starts up or when the user logs in.

Add this code to your `NotificationContext` or `AppDataContext`:

```typescript
import * as Notifications from 'expo-notifications';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function registerPushToken() {
  try {
    // Get push token from Expo
    const { data: token } = await Notifications.getExpoPushTokenAsync();
    
    // Get auth token
    const authToken = await AsyncStorage.getItem('token');
    if (!authToken) return;

    // Send to backend
    const response = await axios.post(
      `${BACKEND_URL}/api/auth/push-token`,
      { pushToken: token },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    console.log('Push token registered:', response.data);
  } catch (error) {
    console.error('Failed to register push token:', error);
  }
}
```

Call `registerPushToken()` after login and when the app starts.

### Step 3: Test Push Notifications

#### Test 1: Using the Test Endpoint
1. Login to your mobile app
2. Use a REST client (Postman, curl, etc.) to send a test notification:

```bash
curl -X POST http://192.168.137.1:4000/api/notifications/test \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

You should receive a push notification on your device!

#### Test 2: Using the Profile Screen
Add a "Test Backend Notification" button to the Profile screen:

```typescript
// In Profile.tsx menuItems
{ id: 9, iconName: 'cloud-upload-outline', title: 'Test Backend Notification' }

// In handleMenuPress
if (item.title === 'Test Backend Notification') {
  const token = await AsyncStorage.getItem('token');
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/notifications/test`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    Alert.alert('Success', 'Backend notification sent!');
  } catch (error) {
    Alert.alert('Error', 'Failed to send notification');
  }
}
```

### Step 4: Integrate with Real Events

Now you can send notifications when real events occur. Here are some examples:

#### Appointment Confirmation
**File**: `src/controllers/appointmentController.js`
```javascript
const { createNotification } = require('./notificationController');

// After appointment is created
await createNotification(patientId, {
  title: 'Appointment Confirmed',
  description: `Your appointment with Dr. ${doctorName} is scheduled for ${appointmentTime}`,
  type: 'appointment',
  iconName: 'calendar',
  iconColor: '#34D399',
  relatedId: appointment.id
});
```

#### Order Status Update
**File**: `src/controllers/orderController.js`
```javascript
// When order status changes
await createNotification(userId, {
  title: 'Order Status Updated',
  description: `Your order #${orderId} has been ${status}`,
  type: 'order',
  iconName: 'cube',
  iconColor: '#3B82F6',
  relatedId: orderId
});
```

#### New Message
**File**: `src/controllers/chatController.js`
```javascript
// When doctor sends a message
await createNotification(patientId, {
  title: `New message from Dr. ${doctorName}`,
  description: message.substring(0, 100),
  type: 'message',
  iconName: 'chatbubble',
  iconColor: '#8B5CF6',
  relatedId: chatId
});
```

## Files Modified

### Backend Files
1. **src/controllers/notificationController.js**
   - Added `createNotification()` function
   - Added `sendPushNotification()` function
   - Added `sendTestNotification()` endpoint handler

2. **src/controllers/authController.js**
   - Added `savePushToken()` function

3. **src/routes/notifications.js**
   - Added `POST /api/notifications/test` route

4. **src/routes/auth.js**
   - Added `POST /api/auth/push-token` route

5. **src/routes/migration.js** (NEW)
   - Migration endpoint for adding push_token column

6. **src/index.js**
   - Added migration routes

7. **db/add_push_token_migration.sql** (NEW)
   - SQL migration script

8. **runMigration.js** (NEW)
   - Node.js migration runner

## How It Works

```
┌─────────────────┐
│   Mobile App    │
│                 │
│  1. Gets push   │
│     token from  │
│     Expo        │
│                 │
│  2. Sends token │
│     to backend  │
│     on login    │
└────────┬────────┘
         │
         │ POST /api/auth/push-token
         │ { pushToken: "Expo[...]" }
         │
         ▼
┌─────────────────────────┐
│   Backend Server        │
│                         │
│  3. Stores push_token   │
│     in patients table   │
│                         │
│  4. When event occurs:  │
│     - Appointment       │
│     - Order update      │
│     - New message       │
│                         │
│  5. createNotification()│
│     - Saves to DB       │
│     - Calls Expo API    │
└────────┬────────────────┘
         │
         │ POST https://exp.host/--/api/v2/push/send
         │ { to: token, title: "...", body: "..." }
         │
         ▼
┌─────────────────────────┐
│   Expo Push Service     │
│                         │
│  6. Delivers to device  │
└────────┬────────────────┘
         │
         │ Push Notification
         │
         ▼
┌─────────────────┐
│   Mobile App    │
│                 │
│  7. Shows       │
│     notification│
│     in system   │
│     tray        │
└─────────────────┘
```

## Troubleshooting

### Push token not saving
- Check that the migration ran successfully
- Verify the `patients` table has a `push_token` column
- Check backend logs for errors

### Notifications not appearing
- Verify the push token is being sent from the mobile app
- Check the backend logs for push notification errors
- Ensure notification permissions are granted on the device
- Test with the local notification first (which you've already confirmed works)

### Invalid push token errors
- Expo push tokens are only generated for physical devices and production builds
- Development builds may have different token formats
- Tokens can expire - implement token refresh logic

## Next Steps

1. ✅ Run the migration to add the push_token column
2. ✅ Test the migration endpoint
3. ⬜ Update mobile app to send push token on login
4. ⬜ Test backend notifications using the test endpoint
5. ⬜ Add notifications to real events (appointments, orders, etc.)
6. ⬜ Build and test on a physical device

## Notes

- Push tokens are device-specific and can expire
- The backend gracefully handles missing tokens (doesn't throw errors)
- Notifications are stored in the database even if push fails
- You can view all backend operations in the log dashboard: http://192.168.137.1:4000/logs.html
