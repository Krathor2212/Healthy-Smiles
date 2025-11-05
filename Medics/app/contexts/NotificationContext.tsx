import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL || 'http://10.10.112.140:4000';

// Configure how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type Notification = {
  id: string;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  iconName: string;
  iconColor: string;
  type?: string;
  relatedId?: string;
  createdAt: string;
};

type NotificationContextType = {
  unreadCount: number;
  notifications: Notification[];
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  handleNotificationPress: (notification: Notification, navigation: any) => void;
  expoPushToken: string;
  registerPushToken: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [expoPushToken, setExpoPushToken] = useState('');
  const tokenSentRef = useRef(false);

  // Register for push notifications
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      console.log('📱 Push token received:', token);
      if (token) {
        setExpoPushToken(token);
        console.log('🔄 Sending push token to backend...');
        // Send token to backend
        sendPushTokenToBackend(token);
      } else {
        console.warn('⚠️ No push token obtained from device');
      }
    });

    // Listen for notifications when app is in foreground
    const notificationListener = Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
      console.log('Notification received in foreground:', notification);
      refreshNotifications();
    });

    // Listen for notification taps
    const responseListener = Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
      console.log('Notification tapped:', response);
      const data = response.notification.request.content.data;
      
      // Mark as read if notification ID is provided
      if (data?.notificationId) {
        markAsRead(data.notificationId as string);
      }
      
      // Refresh notifications to update UI
      refreshNotifications();
      
      // Note: Navigation should be handled by the screen that displays notifications
      // You can access data.type and data.relatedId to determine where to navigate
    });

    return () => {
      if (notificationListener) {
        notificationListener.remove();
      }
      if (responseListener) {
        responseListener.remove();
      }
    };
  }, []);

  // Retry sending push token when auth token becomes available
  useEffect(() => {
    if (expoPushToken && !tokenSentRef.current) {
      const checkAndSendToken = async () => {
        const authToken = await AsyncStorage.getItem('token');
        if (authToken) {
          console.log('🔑 Auth token found, retrying push token registration...');
          await sendPushTokenToBackend(expoPushToken);
          tokenSentRef.current = true;
        }
      };

      // Check immediately
      checkAndSendToken();

      // Also check every 5 seconds for first minute after app start
      const interval = setInterval(checkAndSendToken, 5000);
      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 60000); // Stop after 1 minute

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [expoPushToken]);

  // Fetch notifications from backend
  const refreshNotifications = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${BACKEND_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const allNotifications = [
          ...(data.notifications.new || []),
          ...(data.notifications.earlier || [])
        ];
        setNotifications(allNotifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Refresh notifications error:', error);
    }
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(`${BACKEND_URL}/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isRead: true })
      });

      if (response.ok) {
        await refreshNotifications();
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  // Handle notification press - navigate to appropriate screen
  const handleNotificationPress = (notification: Notification, navigation: any) => {
    // Mark as read
    markAsRead(notification.id);

    // Navigate based on notification type
    switch (notification.type) {
      case 'appointment':
        navigation.navigate('Appointments');
        break;
      case 'payment':
      case 'order':
        navigation.navigate('PaymentHistory');
        break;
      case 'message':
        navigation.navigate('AllChatsScreen');
        break;
      case 'prescription':
        navigation.navigate('Prescriptions');
        break;
      default:
        // Stay on current screen or go to notifications
        break;
    }
  };

  // Send push token to backend
  const sendPushTokenToBackend = async (token: string) => {
    try {
      if (!token) {
        console.log('No push token to send to backend');
        return;
      }
      
      const authToken = await AsyncStorage.getItem('token');
      if (!authToken) {
        console.log('No auth token, skipping push token registration');
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/auth/push-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pushToken: token })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Push token registered with backend:', data.message);
      } else {
        const errorData = await response.json();
        console.warn('Failed to register push token with backend:', response.status, errorData);
      }
    } catch (error) {
      console.error('Send push token error:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        refreshNotifications,
        markAsRead,
        handleNotificationPress,
        expoPushToken,
        registerPushToken: () => sendPushTokenToBackend(expoPushToken)
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// Register for push notifications
async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#34D399',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    
    if (status !== 'granted') {
      console.warn('Notification permission denied by user');
      alert('Please enable notifications in your device settings to receive updates.');
    }
  }
  
  if (finalStatus !== 'granted') {
    console.warn('Failed to get push token for push notification!');
    return;
  }

  try {
    // For standalone APK builds, we can get the token without strict project ID requirement
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    
    console.log('🔍 Attempting to get push token...');
    console.log('📋 Project ID:', projectId || 'Not found');
    console.log('📱 Platform:', Platform.OS);
    console.log('🏗️ Is Device:', Constants.isDevice, '(Note: APK builds may report false)');
    
    // Don't check isDevice for APK builds - they often report false even on real devices
    
    try {
      if (projectId) {
        console.log('✅ Using project ID method...');
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: projectId
        });
        token = tokenData.data;
        console.log('✅ Got Expo push token via project ID:', token);
      } else {
        console.log('⚠️ No project ID, trying default method...');
        const tokenData = await Notifications.getExpoPushTokenAsync();
        token = tokenData.data;
        console.log('✅ Got Expo push token:', token);
      }
    } catch (expoErr: any) {
      console.warn('❌ Expo push token failed:', expoErr.message);
      
      // Fallback: Try to get device push token (works for standalone builds)
      console.log('🔄 Trying device push token method...');
      try {
        const deviceTokenData = await Notifications.getDevicePushTokenAsync();
        const deviceToken = deviceTokenData.data;
        
        // Format device token as Expo token for compatibility
        if (Platform.OS === 'android' && typeof deviceToken === 'string') {
          // Android FCM token - wrap it as an Expo token
          token = `ExponentPushToken[${deviceToken}]`;
          console.log('✅ Got device push token (formatted):', token);
        } else {
          token = String(deviceToken);
          console.log('✅ Got device push token:', token);
        }
      } catch (deviceErr: any) {
        console.error('❌ Device push token also failed:', deviceErr.message);
        console.error('� This usually means:');
        console.error('   1. Running on emulator (not supported)');
        console.error('   2. No Google Play Services (Android)');
        console.error('   3. Network connectivity issues');
      }
    }
    
    if (token) {
      console.log('🎉 Successfully obtained push token!');
      console.log('📏 Token length:', token.length);
    } else {
      console.warn('⚠️ Could not obtain any push token');
    }
  } catch (error: any) {
    console.error('❌ Critical error getting push token:', error);
    console.error('Stack:', error.stack);
  }

  return token;
}
