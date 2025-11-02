import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../../Navigation/types';
import AppHeader from '../../components/AppHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL || 'http://10.10.112.140:4000';

type NavigationProp = StackNavigationProp<RootStackParamList>;

type PaymentItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  amount: number;
  currency?: string;
  status: 'Paid' | 'Pending';
  type?: 'consultation' | 'pharmacy';
  paymentMethod?: string;
  transactionId?: string;
};

// --- Constants ---
const MAIN_GREEN = '#34D399';
const TEXT_PRIMARY = '#1F2937';
const TEXT_SECONDARY = '#6B7280';
const BG_LIGHT_GRAY = '#F3F4F6';
const BORDER_COLOR = '#E5E7EB';

// --- Reusable Components ---

/**
 * Custom Header for this page, including back button and title
 */
const PaymentHistoryHeader: React.FC<{ onBackPress: () => void }> = ({ onBackPress }) => (
  <View style={styles.headerContainer}>
    <TouchableOpacity onPress={onBackPress} style={styles.backButton} activeOpacity={0.6}>
      <Feather name="arrow-left" size={24} color={TEXT_PRIMARY} />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Payment History</Text>
    <TouchableOpacity activeOpacity={0.6}>
      <Feather name="bell" size={24} color={TEXT_PRIMARY} />
    </TouchableOpacity>
  </View>
);

/**
 * Renders a single payment history item card
 */
const PaymentItemCard: React.FC<{ item: PaymentItem }> = ({ item }) => {
  const isPaid = item.status === 'Paid';
  const iconName = item.type === 'pharmacy' ? 'pill' : 'calendar-month-outline';

  return (
    <View style={styles.cardContainer}>
      <View style={[styles.cardIconBg, { backgroundColor: MAIN_GREEN + '20' }]}>
        <MaterialCommunityIcons
          name={iconName as any}
          size={26}
          color={MAIN_GREEN}
        />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
        <Text style={styles.cardDate}>{formatPaymentDate(item.date)}</Text>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.cardAmount}>{item.currency || '₹'}{item.amount.toFixed(2)}</Text>
        <View style={[styles.statusBadge, isPaid ? styles.paidBadge : styles.pendingBadge]}>
          <Text style={[styles.statusText, isPaid ? styles.paidText : styles.pendingText]}>
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );
};

const formatPaymentDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// --- Main Payment History Screen Component ---

const PaymentHistoryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'completed'>('completed');
  const [upcomingPayments, setUpcomingPayments] = useState<PaymentItem[]>([]);
  const [completedPayments, setCompletedPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.warn('No token found, user not authenticated');
        setUpcomingPayments([]);
        setCompletedPayments([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/payments`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUpcomingPayments(data.payments?.upcoming || []);
        setCompletedPayments(data.payments?.completed || []);
      } else if (response.status === 401) {
        await AsyncStorage.removeItem('token');
        setUpcomingPayments([]);
        setCompletedPayments([]);
      } else {
        console.error('Failed to fetch payments:', response.status);
        setUpcomingPayments([]);
        setCompletedPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setUpcomingPayments([]);
      setCompletedPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Profile');
    }
  };

  const currentPayments = selectedTab === 'upcoming' ? upcomingPayments : completedPayments;

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={BG_LIGHT_GRAY} />
      <AppHeader 
        title="Payment History" 
        onBack={handleBackPress}
        right={<Feather name="bell" size={24} color={TEXT_PRIMARY} />}
        onRightPress={() => navigation.navigate('Notifications')}
      />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'upcoming' && styles.activeTabButton]}
          onPress={() => setSelectedTab('upcoming')}
        >
          <Text
            style={[styles.tabButtonText, selectedTab === 'upcoming' && styles.activeTabButtonText]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'completed' && styles.activeTabButton]}
          onPress={() => setSelectedTab('completed')}
        >
          <Text
            style={[styles.tabButtonText, selectedTab === 'completed' && styles.activeTabButtonText]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={MAIN_GREEN} />
            <Text style={styles.loadingText}>Loading payments...</Text>
          </View>
        ) : (
          <FlatList
            data={currentPayments}
            renderItem={({ item }) => <PaymentItemCard item={item} />}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Feather name="credit-card" size={64} color={TEXT_SECONDARY} />
                <Text style={styles.emptyText}>No {selectedTab} payments found</Text>
              </View>
            )}
          />
        )}
      </ScrollView>
    </View>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_LIGHT_GRAY,
  },
  container: {
    flex: 1,
    backgroundColor: BG_LIGHT_GRAY,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  contentContainer: {
    paddingBottom: 30, // For bottom spacing
  },
  // Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: BG_LIGHT_GRAY,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    flex: 1, // Allows title to take available space
    textAlign: 'center',
    marginLeft: -40, // Adjust to center given back button
  },
  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E0E0E0', // Light gray background for tabs
    borderRadius: 25,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 22,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: MAIN_GREEN,
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_SECONDARY,
  },
  activeTabButtonText: {
    color: '#FFFFFF',
  },
  // Payment Card
  separator: {
    height: 12,
  },
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
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  cardDate: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 4,
  },
  cardRight: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  paidBadge: {
    backgroundColor: MAIN_GREEN + '30', // Light green
  },
  pendingBadge: {
    backgroundColor: '#F59E0B' + '30', // Light amber for pending
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  paidText: {
    color: MAIN_GREEN,
  },
  pendingText: {
    color: '#F59E0B',
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: TEXT_SECONDARY,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: TEXT_SECONDARY,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default PaymentHistoryScreen;
