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
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [expoPushToken, setExpoPushToken] = useState('');

  // Register for push notifications
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        // Send token to backend
        sendPushTokenToBackend(token);
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

      const response = await fetch(`${BACKEND_URL}/api/user/push-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pushToken: token })
      });
      
      if (response.ok) {
        console.log('Push token registered with backend');
      } else {
        console.warn('Failed to register push token with backend:', response.status);
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
        expoPushToken
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
  }
  
  if (finalStatus !== 'granted') {
    console.warn('Failed to get push token for push notification!');
    return;
  }

  try {
    // Get project ID from app.json or app.config.js
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    
    if (!projectId) {
      console.warn('No Expo project ID found. Push notifications will work locally but not for remote notifications.');
      console.warn('To enable remote push notifications, add projectId to app.json under expo.extra.eas.projectId');
      return; // Skip getting push token in development
    }
    
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: projectId
    })).data;
    console.log('Expo Push Token:', token);
  } catch (error) {
    console.error('Error getting push token:', error);
    // Don't throw - allow app to continue without push tokens
  }

  return token;
}
