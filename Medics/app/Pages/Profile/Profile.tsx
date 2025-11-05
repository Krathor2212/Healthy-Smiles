import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import type { RootStackParamList } from '../../Navigation/types';
import { sendTestNotification } from '../../utils/testNotification';
import { useNotifications } from '../../contexts/NotificationContext';
import { forceGetPushToken } from '../../utils/forcePushToken';

const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL || 'http://192.168.137.1:4000';

// --- Types and Constants ---

const { width } = Dimensions.get('window');

interface MenuItem {
  id: number;
  iconName: string;
  iconSet: 'Ionicons' | 'MaterialCommunityIcons';
  title: string;
  isLogout?: boolean;
}

interface StatItem {
  id: number;
  iconName: string;
  value: string;
  label: string;
}

const menuItems: MenuItem[] = [
  { id: 0, iconName: 'create-outline', iconSet: 'Ionicons', title: 'Edit Profile' },
  { id: 1, iconName: 'folder-outline', iconSet: 'Ionicons', title: 'Files' },
  { id: 2, iconName: 'shield-checkmark-outline', iconSet: 'Ionicons', title: 'Authorized Doctors' },
  { id: 3, iconName: 'clipboard-text-outline', iconSet: 'MaterialCommunityIcons', title: 'Appointment' },
  { id: 4, iconName: 'medical-outline', iconSet: 'Ionicons', title: 'Prescriptions' },
  { id: 5, iconName: 'wallet-outline', iconSet: 'Ionicons', title: 'Payment History' },
  { id: 6, iconName: 'chatbox-ellipses-outline', iconSet: 'Ionicons', title: 'FAQs' },
  { id: 12, iconName: 'refresh-outline', iconSet: 'Ionicons', title: 'Force Get Push Token' },
  { id: 11, iconName: 'information-circle-outline', iconSet: 'Ionicons', title: 'Show Push Token Info' },
  { id: 8, iconName: 'notifications-outline', iconSet: 'Ionicons', title: 'Test Notification' },
  { id: 9, iconName: 'cloud-upload-outline', iconSet: 'Ionicons', title: 'Test Backend Notification' },
  { id: 10, iconName: 'sync-outline', iconSet: 'Ionicons', title: 'Register Push Token' },
  { id: 7, iconName: 'log-out-outline', iconSet: 'Ionicons', title: 'Logout', isLogout: true },
];

const statItems: StatItem[] = [
  { id: 1, iconName: 'human-male-height', value: '5\'6"', label: 'Height' },
  { id: 2, iconName: 'weight-lifter', value: '103lbs', label: 'Weight' },
];

type NavigationProp = StackNavigationProp<RootStackParamList>;

const StatBlock: React.FC<{ item: StatItem }> = ({ item }) => (
  <View style={styles.statBlock}>
    <MaterialCommunityIcons name={item.iconName as any} size={22} color="#333" />
    <Text style={styles.statValue}>{item.value}</Text>
    <Text style={styles.statLabel}>{item.label}</Text>
  </View>
);
 
export default function ProfileScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Get push token registration function
  const { registerPushToken, expoPushToken } = useNotifications();

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.warn('No token found, user not authenticated');
        setLoading(false);
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile({
          name: data.name || 'User',
          email: data.email || '',
          phone: data.phone || '',
          avatar: data.avatar || 'https://i.pravatar.cc/300?img=40',
          stats: {
            height: data.height || "5'6\"",
            weight: data.weight || '103lbs',
          }
        });
      } else if (response.status === 401) {
        await AsyncStorage.removeItem('token');
        navigation.navigate('Login' as any);
      } else {
        console.error('Failed to fetch profile:', response.status);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  // Fetch profile when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  const handleMenuItemPress = useCallback(
    (item: MenuItem) => {
      if (item.isLogout) {
        Alert.alert('Logout', 'Are you sure you want to log out?', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              try {
                // fully clear all session-related keys so biometric won't appear after logout
                await AsyncStorage.multiRemove(['token', 'hasSession', 'savedEmail', 'savedPassword', 'userProfile']);
              } catch (e) {
                console.warn('Failed to clear session on logout', e);
              }

              // Reset navigation stack so back button cannot return to protected screens
              navigation.reset({ index: 0, routes: [{ name: 'Intro' as any }] });
            },
          },
        ]);
        return;
      }

      // Map titles to routes
      if (item.title === 'Edit Profile') {
        navigation.navigate('EditProfile');
        return;
      }

      if (item.title === 'Files') {
        navigation.navigate('MedicalFiles' as any);
        return;
      }

      if (item.title === 'Authorized Doctors') {
        navigation.navigate('AuthorizedDoctors' as any);
        return;
      }

      if (item.title === 'Appointment') {
        navigation.navigate('Appointments' as any);
        return;
      }

      if (item.title === 'Prescriptions') {
        navigation.navigate('Prescriptions' as any);
        return;
      }

      if (item.title === 'Payment History') {
        navigation.navigate('PaymentHistory' as any);
        return;
      }
      if (item.title === 'FAQs') {
        navigation.navigate('FAQs' as any);
        return;
      }

      if (item.title === 'Force Get Push Token') {
        // Force get push token with detailed debugging
        (async () => {
          const token = await forceGetPushToken();
          if (token) {
            // Try to register it immediately
            try {
              const authToken = await AsyncStorage.getItem('token');
              if (authToken) {
                const response = await fetch(`${BACKEND_URL}/api/auth/push-token`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ pushToken: token })
                });

                if (response.ok) {
                  Alert.alert('Complete Success! 🎉', 'Push token obtained AND registered with backend!');
                } else {
                  const error = await response.json();
                  Alert.alert('Token Obtained But...', `Got token but backend registration failed: ${error.error}`);
                }
              }
            } catch (err) {
              console.error('Registration error:', err);
            }
          }
        })();
        return;
      }

      if (item.title === 'Show Push Token Info') {
        // Show debug info about push token
        const Constants = require('expo-constants').default;
        const Platform = require('react-native').Platform;
        
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        const isDevice = Constants.isDevice;
        
        Alert.alert(
          'Push Token Debug Info',
          `Platform: ${Platform.OS}\n` +
          `Is Device: ${isDevice ? 'Yes ✅' : 'No (Emulator) ❌'}\n` +
          `Project ID: ${projectId || 'Not found ❌'}\n` +
          `Push Token: ${expoPushToken ? expoPushToken.substring(0, 40) + '...' : 'Not available ❌'}\n` +
          `Token Length: ${expoPushToken ? expoPushToken.length : 0}\n\n` +
          `If token is missing:\n` +
          `1. Check logs with USB connected\n` +
          `2. Restart the app\n` +
          `3. Check notification permissions`,
          [
            {
              text: 'Copy Token',
              onPress: () => {
                if (expoPushToken) {
                  Alert.alert('Token', expoPushToken);
                }
              }
            },
            { text: 'OK' }
          ]
        );
        return;
      }

      if (item.title === 'Test Notification') {
        sendTestNotification().then(success => {
          if (success) {
            Alert.alert('Success', 'Test notification sent! Check your notification bar.');
          } else {
            Alert.alert('Failed', 'Could not send notification. Please check permissions in device settings.');
          }
        });
        return;
      }

      if (item.title === 'Test Backend Notification') {
        // Test backend push notification
        (async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
              Alert.alert('Error', 'Not authenticated. Please login again.');
              return;
            }

            const response = await fetch(`${BACKEND_URL}/api/notifications/test`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const data = await response.json();
              Alert.alert('Success', 'Backend push notification sent! Check your notification bar in a moment.');
              console.log('Backend notification response:', data);
            } else {
              const errorData = await response.json();
              Alert.alert('Failed', `Could not send backend notification: ${errorData.error || 'Unknown error'}`);
              console.error('Backend notification error:', errorData);
            }
          } catch (error) {
            console.error('Test backend notification error:', error);
            Alert.alert('Error', 'Failed to send backend notification. Check console for details.');
          }
        })();
        return;
      }

      if (item.title === 'Register Push Token') {
        // Manually register push token with retry
        (async () => {
          try {
            console.log('📱 Current push token:', expoPushToken);
            
            if (!expoPushToken) {
              // Token not available, show detailed alert with option to retry
              Alert.alert(
                'No Push Token', 
                'Push token not available. This can happen if:\n\n' +
                '1. You\'re on an emulator (use physical device)\n' +
                '2. Notification permissions were denied\n' +
                '3. Network connection issue\n\n' +
                'Please:\n' +
                '• Grant notification permissions\n' +
                '• Restart the app\n' +
                '• Use a physical device',
                [
                  { 
                    text: 'Check Permissions', 
                    onPress: async () => {
                      const Notifications = await import('expo-notifications');
                      const { status } = await Notifications.requestPermissionsAsync();
                      if (status === 'granted') {
                        Alert.alert(
                          'Permissions Granted!', 
                          'Notification permissions are now enabled.\n\nPlease restart the app to obtain the push token.',
                          [
                            { 
                              text: 'Force Retry', 
                              onPress: () => {
                                // Force app to retry getting token
                                Alert.alert('Info', 'Please close and reopen the app completely.');
                              }
                            },
                            { text: 'OK' }
                          ]
                        );
                      } else {
                        Alert.alert('Denied', 'Notification permissions are required. Please enable them in Settings → Apps → Healthy Smiles → Notifications.');
                      }
                    }
                  },
                  { text: 'OK' }
                ]
              );
              return;
            }

            console.log('📱 Manually registering push token:', expoPushToken);
            await registerPushToken();
            Alert.alert(
              'Success ✅', 
              `Push token has been registered with the backend!\n\nToken: ${expoPushToken.substring(0, 40)}...`
            );
          } catch (error) {
            console.error('Manual push token registration error:', error);
            Alert.alert('Error', 'Failed to register push token: ' + (error as Error).message);
          }
        })();
        return;
      }
      

      // fallback: log
      console.log('menu press:', item.title);
    },
    [navigation]
  );

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <View style={styles.container}>
      {/* back button sits above header; top uses safe area inset */}
      <Pressable
        onPress={onBack}
        android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
        style={[styles.backButton, { top: insets.top + 10 }]}
        accessibilityLabel="Go back"
      >
        <Feather name="chevron-left" size={20} color="#1A202C" />
      </Pressable>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: 0 }]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00C4CC" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : (
          <>
            <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
              <Image source={{ uri: userProfile?.avatar ?? 'https://i.pravatar.cc/300?img=40' }} style={styles.profileImage} />
              <Text style={styles.profileName}>{userProfile?.name ?? 'User'}</Text>
            </View>

        <View style={[styles.statsContainer, { marginTop: -40 }]}>
          {(() => {
            const stats = userProfile?.stats;
            if (stats) {
              return (
                <>
                  <StatBlock item={{ id: 1, iconName: 'ruler', value: stats.height || "5'6\"", label: 'Height' }} />
                  <View style={styles.statDivider} />
                  <StatBlock item={{ id: 2, iconName: 'weight-lifter', value: stats.weight || '103lbs', label: 'Weight' }} />
                </>
              );
            }

            return statItems.map((item, index) => (
              <React.Fragment key={item.id}>
                <StatBlock item={item} />
                {index < statItems.length - 1 && <View style={styles.statDivider} />}
              </React.Fragment>
            ));
          })()}
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item) => {
            const IconComponent = item.iconSet === 'Ionicons' ? Ionicons : MaterialCommunityIcons;
            const isLogout = !!item.isLogout;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleMenuItemPress(item)}
                accessibilityRole="button"
                accessibilityLabel={item.title}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemContent}>
                  <View style={[styles.menuIconContainer, isLogout && { backgroundColor: '#FFEDED' }]}>
                    <IconComponent name={item.iconName as any} size={22} color={isLogout ? '#E53935' : '#333'} />
                  </View>
                  <Text style={[styles.menuItemText, isLogout && { color: '#E53935' }]}>{item.title}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={22} color="#999" />
              </TouchableOpacity>
            );
          })}
        </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 32 },
  header: {
    backgroundColor: '#00C4CC',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 28,
  },
  backButton: {
    padding: 8,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    position: 'absolute',
    left: 16,
    zIndex: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 10,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 50,
  },

  // Stats
  statsContainer: {
    width: width * 0.92,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  statBlock: { alignItems: 'center', width: '30%' },
  statDivider: { height: '80%', width: 1, backgroundColor: '#eee', alignSelf: 'center' },
  statValue: { fontSize: 16, fontWeight: '700', color: '#333', marginTop: 6 },
  statLabel: { fontSize: 12, color: '#999', marginTop: 2, textAlign: 'center' },

  // Menu
  menuContainer: { marginTop: 28, paddingHorizontal: 20 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuItemContent: { flexDirection: 'row', alignItems: 'center' },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    backgroundColor: '#f9f9f9',
  },
  menuItemText: { fontSize: 16, color: '#333', fontWeight: '500' },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },

  // Tab placeholder
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
  },
});