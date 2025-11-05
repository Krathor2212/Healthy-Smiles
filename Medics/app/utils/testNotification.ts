import * as Notifications from 'expo-notifications';

/**
 * Test if local notifications are working
 * Call this function to send a test notification
 */
export async function sendTestNotification() {
  try {
    // Request permissions first
    const { status } = await Notifications.getPermissionsAsync();
    
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        console.log('Permission not granted for notifications');
        return false;
      }
    }

    // Schedule a local notification immediately
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification 📬",
        body: 'This is a test notification from Healthy Smiles!',
        data: { testData: 'Test notification data' },
        sound: true,
        vibrate: [0, 250, 250, 250],
      },
      trigger: null, // Show immediately
    });

    console.log('Test notification sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending test notification:', error);
    return false;
  }
}

/**
 * Send a scheduled test notification (after 5 seconds)
 */
export async function sendScheduledTestNotification() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        console.log('Permission not granted for notifications');
        return false;
      }
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Scheduled Test 📬",
        body: 'This notification was scheduled 5 seconds ago!',
        data: { testData: 'Scheduled test' },
        sound: true,
      },
      trigger: {
        seconds: 5,
      },
    });

    console.log('Scheduled test notification will appear in 5 seconds');
    return true;
  } catch (error) {
    console.error('Error sending scheduled notification:', error);
    return false;
  }
}

/**
 * Check notification permissions
 */
export async function checkNotificationPermissions() {
  const { status } = await Notifications.getPermissionsAsync();
  console.log('Current notification permission status:', status);
  return status;
}
