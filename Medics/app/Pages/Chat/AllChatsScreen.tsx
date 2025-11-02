import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../../Navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import AppHeader from '../../components/AppHeader';

const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL || 'http://10.10.112.140:4000';

// --- Constants ---
const MAIN_GREEN = '#34D399'; // A green color matching the design
const TEXT_PRIMARY = '#1F2937';
const TEXT_SECONDARY = '#6B7280';
const BG_LIGHT_GRAY = '#F3F4F6';
const BORDER_COLOR = '#E5E7EB';

// --- Types ---

type ChatContact = {
  id: string;
  doctorId: string;
  doctorName: string;
  lastMessage: string;
  lastMessageTime: string;
  doctorRating: number;
  unreadCount?: number;
  doctorAvatar: string;
  isOnline?: boolean;
};

// --- Reusable Components ---

/**
 * Renders a single chat contact card
 */
const ChatContactCard: React.FC<{ 
  item: ChatContact;
  onPress: (item: ChatContact) => void;
}> = ({ item, onPress }) => {
  // Safely ensure all values are strings
  const safeItem = {
    id: String(item.id || ''),
    doctorId: String(item.doctorId || ''),
    doctorName: String(item.doctorName || 'Unknown Doctor'),
    lastMessage: String(item.lastMessage || 'No messages yet'),
    lastMessageTime: String(item.lastMessageTime || ''),
    doctorRating: String(item.doctorRating != null ? item.doctorRating : '0'),
    unreadCount: item.unreadCount != null ? Number(item.unreadCount) : 0,
    doctorAvatar: String(item.doctorAvatar || 'https://i.ibb.co/L8G2JvM/female-doctor-avatar.png'),
  };

  return (
    <TouchableOpacity style={styles.chatCard} onPress={() => onPress(item)}>
      <Image source={{ uri: safeItem.doctorAvatar }} style={styles.avatar} />
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{safeItem.doctorName}</Text>
        <Text style={styles.chatLastMessage} numberOfLines={1}>
          {safeItem.lastMessage}
        </Text>
        <View style={styles.chatMeta}>
          <Ionicons name="star" size={16} color="#F59E0B" />
          <Text style={styles.chatRating}>{safeItem.doctorRating}</Text>
          <Ionicons name="location-outline" size={16} color={TEXT_SECONDARY} />
        </View>
      </View>
      <View style={styles.chatRight}>
        <Text style={styles.chatTime}>{safeItem.lastMessageTime}</Text>
        {safeItem.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{String(safeItem.unreadCount)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// --- Main Chat Screen Component ---

const AllChatsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.warn('No token found, user not authenticated');
        setContacts([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/chats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched chats data:', JSON.stringify(data.contacts, null, 2));
        setContacts(data.contacts || []);
      } else if (response.status === 401) {
        // Token expired or invalid
        await AsyncStorage.removeItem('token');
        setContacts([]);
      } else {
        console.error('Failed to fetch chats:', response.status);
        setContacts([]);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleChatPress = (contact: ChatContact) => {
    navigation.navigate('IndividualChatScreen', {
      chatId: contact.id,
      doctorId: contact.doctorId,
      doctorName: contact.doctorName || 'Unknown Doctor',
      doctorSpeciality: `${contact.doctorRating?.toString() || '0'} ⭐ General Physician`,
      doctorAvatar: contact.doctorAvatar,
    });
  };

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(contact =>
    (contact.doctorName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={BG_LIGHT_GRAY} />
      <AppHeader title="Chats" onBack={handleBack} />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]} // Makes the search bar stick
      >
        {/* Search Bar Container - Stays blank for stickiness */}
        <View style={styles.stickyHeaderContainer}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color={TEXT_SECONDARY} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search chats"
              placeholderTextColor={TEXT_SECONDARY}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Chat Contacts List */}
        <View style={styles.listContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={MAIN_GREEN} />
              <Text style={styles.loadingText}>Loading chats...</Text>
            </View>
          ) : filteredContacts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color={TEXT_SECONDARY} />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No chats found' : 'No chats yet'}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try a different search term' : 'Start a conversation with a doctor'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredContacts}
              renderItem={({ item }) => <ChatContactCard item={item} onPress={handleChatPress} />}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>
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
  },
  // Sticky Header
  stickyHeaderContainer: {
    backgroundColor: BG_LIGHT_GRAY, // Match background
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: TEXT_PRIMARY,
  },
  // Chat List
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30, // For bottom spacing
    marginTop: 8,
  },
  separator: {
    height: 12,
  },
  // Chat Card
  chatCard: {
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
    backgroundColor: BORDER_COLOR, // Placeholder background
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
  },
  chatLastMessage: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginTop: 4,
  },
  chatMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  chatRating: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginLeft: 4,
    marginRight: 8,
  },
  chatRight: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  chatTime: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: MAIN_GREEN,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
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
  },
  emptySubtext: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default AllChatsScreen;
