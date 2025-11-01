import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import AppHeader from './components/AppHeader';
import { useNotifications } from './contexts/NotificationContext';
import type { RootStackParamList } from './Navigation/types';

const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL || 'http://10.10.112.140:4000';

type NavigationProp = StackNavigationProp<RootStackParamList>;

// --- Types ---

type Notification = {
  id: string;
  title: string;
  description: string;
  time: string;
  isNew: boolean;
  isRead: boolean;
  iconName: string;
  iconColor: string;
  type?: string;
  relatedId?: string;
};

type NotificationSection = {
  title: string;
  data: Notification[];
};

// --- Constants ---
const MAIN_GREEN = '#34D399';
const TEXT_PRIMARY = '#1F2937';
const TEXT_SECONDARY = '#6B7280';
const BG_LIGHT_GRAY = '#F3F4F6';

// --- Reusable Components ---

/**
 * Renders a single notification item card
 */
const NotificationItem: React.FC<{ 
  item: Notification;
  onPress: (id: string) => void;
}> = ({ item, onPress }) => {
  // Map invalid Feather icon names to valid ones
  const getValidFeatherIcon = (iconName: string): string => {
    const iconMap: { [key: string]: string } = {
      'cart': 'shopping-cart',
      'bag': 'shopping-bag',
      'notifications': 'bell',
      'notification': 'bell',
    };
    return iconMap[iconName] || iconName;
  };

  const validIconName = getValidFeatherIcon(item.iconName);

  return (
    <TouchableOpacity 
      style={styles.cardContainer}
      onPress={() => onPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.cardIconBg, { backgroundColor: item.iconColor + '20' }]}>
        <Feather name={validIconName as any} size={24} color={item.iconColor} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.cardTime}>{item.time}</Text>
        {item.isNew && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );
};

// --- Main Notifications Screen Component ---

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const notificationContext = useNotifications();
  const [sections, setSections] = useState<NotificationSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications from backend
  const fetchNotifications = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Error', 'Please login to view notifications');
        setLoading(false);
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        const newSections: NotificationSection[] = [];

        // Add "New" section if there are unread notifications
        if (data.notifications.new && data.notifications.new.length > 0) {
          newSections.push({
            title: 'New',
            data: data.notifications.new.map((n: any) => ({
              ...n,
              isNew: true
            }))
          });
        }

        // Add "Earlier" section if there are read notifications
        if (data.notifications.earlier && data.notifications.earlier.length > 0) {
          newSections.push({
            title: 'Earlier',
            data: data.notifications.earlier.map((n: any) => ({
              ...n,
              isNew: false
            }))
          });
        }

        setSections(newSections);
        setUnreadCount(data.unreadCount || 0);
        // Also refresh the global notification context
        notificationContext.refreshNotifications();
      } else {
        Alert.alert('Error', data.error || 'Failed to load notifications');
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

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
        // Refresh notifications to update UI and context
        fetchNotifications();
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  // Refresh on pull down
  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications(true);
  };

  // Fetch notifications when screen focuses
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={BG_LIGHT_GRAY} />
      <AppHeader 
        title={unreadCount > 0 ? `Notifications (${unreadCount})` : "Notifications"} 
        onBack={() => navigation.goBack()} 
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MAIN_GREEN} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : sections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="bell-off" size={60} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptySubtitle}>
            You'll see notifications here when you have new updates
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemWrapper}>
              <NotificationItem item={item} onPress={markAsRead} />
            </View>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[MAIN_GREEN]}
              tintColor={MAIN_GREEN}
            />
          }
        />
      )}
    </View>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_LIGHT_GRAY,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 8,
  },
  listContainer: {
    paddingBottom: 30,
  },
  // Section List
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: BG_LIGHT_GRAY,
  },
  itemWrapper: {
    paddingHorizontal: 20, // Apply padding to wrapper, not card
  },
  separator: {
    height: 1,
    backgroundColor: BG_LIGHT_GRAY,
    marginVertical: 6, // Spacing between cards
  },
  // Notification Card
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardIconBg: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
  },
  cardDescription: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginTop: 4,
    lineHeight: 20,
  },
  cardRight: {
    alignItems: 'flex-end',
    marginLeft: 10,
    height: '100%', // Align content to top
    paddingTop: 2, // Small offset
  },
  cardTime: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginBottom: 8,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: MAIN_GREEN,
  },
});

export default NotificationsScreen;