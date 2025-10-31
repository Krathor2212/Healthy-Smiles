import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  SectionList,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import AppHeader from './components/AppHeader';
import type { RootStackParamList } from './Navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

// --- Types ---

type Notification = {
  id: string;
  title: string;
  description: string;
  time: string;
  isNew: boolean;
  iconName: string;
  iconColor: string; // Hex color for the icon
};

type NotificationSection = {
  title: string;
  data: Notification[];
};

// --- Mock Data ---
// Replace this with your API data
const NOTIFICATIONS_DATA: NotificationSection[] = [
  {
    title: 'New',
    data: [
      {
        id: '1',
        title: 'Appointment Confirmed',
        description: 'Your appointment with Dr. Sarah Johnson is confirmed for Nov 10.',
        time: '10:30 AM',
        isNew: true,
        iconName: 'calendar',
        iconColor: '#34D399', // Main green
      },
      {
        id: '2',
        title: 'Payment Successful',
        description: 'Your payment of ₹800 has been successfully processed.',
        time: '10:05 AM',
        isNew: true,
        iconName: 'check-circle',
        iconColor: '#34D399', // Main green
      },
    ],
  },
  {
    title: 'Earlier',
    data: [
      {
        id: '3',
        title: 'Appointment Reminder',
        description: 'You have an upcoming appointment with Dr. Michael Chen tomorrow.',
        time: 'Yesterday',
        isNew: false,
        iconName: 'clock',
        iconColor: '#3B82F6', // Blue
      },
      {
        id: '4',
        title: 'New Message',
        description: 'Dr. Michael Chen sent you a new message.',
        time: 'Yesterday',
        isNew: false,
        iconName: 'message-circle',
        iconColor: '#3B82F6', // Blue
      },
      {
        id: '5',
        title: 'Prescription Ready',
        description: 'Your new prescription is ready for pickup.',
        time: 'Nov 08',
        isNew: false,
        iconName: 'file-text',
        iconColor: '#8B5CF6', // Purple
      },
    ],
  },
];

// --- Constants ---
const MAIN_GREEN = '#34D399';
const TEXT_PRIMARY = '#1F2937';
const TEXT_SECONDARY = '#6B7280';
const BG_LIGHT_GRAY = '#F3F4F6';

// --- Reusable Components ---

/**
 * Renders a single notification item card
 */
const NotificationItem: React.FC<{ item: Notification }> = ({ item }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={[styles.cardIconBg, { backgroundColor: item.iconColor + '20' }]}>
        <Feather name={item.iconName as any} size={24} color={item.iconColor} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.cardTime}>{item.time}</Text>
        {item.isNew && <View style={styles.unreadDot} />}
      </View>
    </View>
  );
};

// --- Main Notifications Screen Component ---

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={BG_LIGHT_GRAY} />
      <AppHeader title="Notifications" onBack={() => navigation.goBack()} />

      <SectionList
        sections={NOTIFICATIONS_DATA}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemWrapper}>
            <NotificationItem item={item} />
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_LIGHT_GRAY,
  },
  listContainer: {
    paddingBottom: 30, // For bottom spacing
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