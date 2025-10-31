import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../Navigation/types';

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
  { id: 2, iconName: 'clipboard-text-outline', iconSet: 'MaterialCommunityIcons', title: 'Appointment' },
  { id: 3, iconName: 'wallet-outline', iconSet: 'Ionicons', title: 'Payment History' },
  { id: 4, iconName: 'chatbox-ellipses-outline', iconSet: 'Ionicons', title: 'FAQs' },
  { id: 5, iconName: 'log-out-outline', iconSet: 'Ionicons', title: 'Logout', isLogout: true },
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
  const [userProfile, setUserProfile] = React.useState<any | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('userProfile');
        if (raw) setUserProfile(JSON.parse(raw));
      } catch (e) {
        console.warn('Failed to load profile', e);
      }
    })();
  }, []);

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

      if (item.title === 'Appointment') {
        navigation.navigate('Appointments' as any);
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
        <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
          <Image source={{ uri: userProfile?.avatar ?? 'https://i.pravatar.cc/300?img=40' }} style={styles.profileImage} />
          <Text style={styles.profileName}>{userProfile?.name ?? 'Amelia Renata'}</Text>
        </View>

        <View style={[styles.statsContainer, { marginTop: -40 }]}>
          {(() => {
            const stats = userProfile?.stats;
            if (stats) {
              return (
                <>
                  <StatBlock item={{ id: 1, iconName: 'ruler', value: stats.height || '', label: 'Height' }} />
                  <View style={styles.statDivider} />
                  <StatBlock item={{ id: 2, iconName: 'weight-lifter', value: stats.weight || '', label: 'Weight' }} />
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