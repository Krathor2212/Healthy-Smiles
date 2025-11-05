import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL || 'http://192.168.137.1:4000';
const POLLING_INTERVAL = 30000; // Check every 30 seconds when app is active
const BACKGROUND_INTERVAL = 60000; // Check every 60 seconds when app is background

interface NotificationPollingContextType {
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
}

const NotificationPollingContext = createContext<NotificationPollingContextType>({
  unreadCount: 0,
  refreshNotifications: async () => {},
});

export const useNotificationPolling = () => useContext(NotificationPollingContext);

export const NotificationPollingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);
  const pollingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const appState = useRef(AppState.currentState);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    // Check if user is authenticated
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/notifications?unreadOnly=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log('Failed to fetch notifications:', response.status);
        return;
      }

      const data = await response.json();
      const newNotifications = data.notifications?.new || [];
      
      setUnreadCount(newNotifications.length);

      // Check if there's a new notification (compared to last check)
      if (newNotifications.length > 0) {
        const latestNotification = newNotifications[0];
        
        // If this is a new notification we haven't seen before
        if (latestNotification.id !== lastNotificationId) {
          console.log('📬 New notification detected, triggering local notification');
          
          // Trigger local notification
          await Notifications.scheduleNotificationAsync({
            content: {
              title: latestNotification.title || 'New Notification',
              body: latestNotification.description || '',
              data: {
                type: latestNotification.type,
                relatedId: latestNotification.relatedId,
                notificationId: latestNotification.id,
              },
            },
            trigger: null, // Immediate
          });

          // Update last seen notification
          setLastNotificationId(latestNotification.id);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Manual refresh function
  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  // Start polling when authenticated
  useEffect(() => {
    const startPolling = async () => {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        // Stop polling if not authenticated
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
          pollingInterval.current = null;
        }
        return;
      }

      // Initial fetch
      fetchNotifications();

      // Start polling
      const pollInterval = appState.current === 'active' ? POLLING_INTERVAL : BACKGROUND_INTERVAL;
      pollingInterval.current = setInterval(fetchNotifications, pollInterval);

      console.log(`📡 Started notification polling (${pollInterval}ms interval)`);
    };

    startPolling();

    // Cleanup
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    };
  }, []); // Run once on mount

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      const token = await AsyncStorage.getItem('token');
      appState.current = nextAppState;

      if (nextAppState === 'active' && token) {
        // App came to foreground - refresh immediately
        console.log('📱 App became active, refreshing notifications');
        fetchNotifications();

        // Restart polling with active interval
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
        }
        pollingInterval.current = setInterval(fetchNotifications, POLLING_INTERVAL);
      } else if (nextAppState === 'background' && token) {
        // App went to background - use longer interval
        console.log('📱 App went to background, using longer polling interval');
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
        }
        pollingInterval.current = setInterval(fetchNotifications, BACKGROUND_INTERVAL);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []); // Run once on mount

  return (
    <NotificationPollingContext.Provider value={{ unreadCount, refreshNotifications }}>
      {children}
    </NotificationPollingContext.Provider>
  );
};
