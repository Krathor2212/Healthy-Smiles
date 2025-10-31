import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../../Navigation/types';
import AppHeader from '../../components/AppHeader';

// --- Types ---

type ChatContact = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  rating: number;
  unreadCount?: number;
  avatar: string; // URL for the avatar image
};

// --- Mock Data ---
// Replace this with your API data
const CHAT_CONTACTS: ChatContact[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    lastMessage: 'Okay, see you then!',
    time: '10:30 AM',
    rating: 4.7,
    avatar: 'https://i.ibb.co/L8G2JvM/female-doctor-avatar.png', // Example avatar
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    lastMessage: 'Okay, see you then!',
    time: '10:30 AM',
    rating: 4.7,
    avatar: 'https://i.ibb.co/r760Vd0/male-doctor-avatar.png', // Example avatar
  },
  {
    id: '3',
    name: 'Dr. Michael Chen',
    lastMessage: 'Okay, see you then!',
    time: '10:30 AM',
    rating: 4.7,
    unreadCount: 1,
    avatar: 'https://i.ibb.co/r760Vd0/male-doctor-avatar.png', // Example avatar
  },
  {
    id: '4',
    name: 'Dr. Sarah Johnson',
    lastMessage: 'Okay, see you then!',
    time: '10:30 AM',
    rating: 4.7,
    avatar: 'https://i.ibb.co/L8G2JvM/female-doctor-avatar.png', // Example avatar
  },
  {
    id: '5',
    name: 'Dr. Emily Davis',
    lastMessage: 'Okay, bush clinter',
    time: '10:30 AM',
    rating: 3.7,
    avatar: 'https://i.ibb.co/q041Y5W/male-doctor-avatar-2.png', // Another example avatar
  },
  {
    id: '6',
    name: 'Dr. Ben Carter',
    lastMessage: 'Energen viorals for mations',
    time: '10:30 AM',
    rating: 4.7,
    unreadCount: 1,
    avatar: 'https://i.ibb.co/c20f1Qj/male-doctor-avatar-3.png', // Another example avatar
  },
];

// --- Constants ---
const MAIN_GREEN = '#34D399'; // A green color matching the design
const TEXT_PRIMARY = '#1F2937';
const TEXT_SECONDARY = '#6B7280';
const BG_LIGHT_GRAY = '#F3F4F6';
const BORDER_COLOR = '#E5E7EB';

// --- Reusable Components ---

/**
 * Renders a single chat contact card
 */
const ChatContactCard: React.FC<{ 
  item: ChatContact;
  onPress: (item: ChatContact) => void;
}> = ({ item, onPress }) => (
  <TouchableOpacity style={styles.chatCard} onPress={() => onPress(item)}>
    <Image source={{ uri: item.avatar }} style={styles.avatar} />
    <View style={styles.chatInfo}>
      <Text style={styles.chatName}>{item.name}</Text>
      <Text style={styles.chatLastMessage} numberOfLines={1}>
        {item.lastMessage}
      </Text>
      <View style={styles.chatMeta}>
        <Ionicons name="star" size={16} color="#F59E0B" />
        <Text style={styles.chatRating}>{item.rating}</Text>
        <Ionicons name="location-outline" size={16} color={TEXT_SECONDARY} />
      </View>
    </View>
    <View style={styles.chatRight}>
      <Text style={styles.chatTime}>{item.time}</Text>
      {item.unreadCount && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unreadCount}</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

// --- Main Chat Screen Component ---

const AllChatsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleChatPress = (contact: ChatContact) => {
    navigation.navigate('IndividualChatScreen', {
      doctorId: contact.id,
      doctorName: contact.name,
      doctorSpeciality: `${contact.rating} ⭐ General Physician`, // You can customize this
      doctorAvatar: contact.avatar,
    });
  };

  // Filter contacts based on search query
  const filteredContacts = CHAT_CONTACTS.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
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
          <FlatList
            data={filteredContacts}
            renderItem={({ item }) => <ChatContactCard item={item} onPress={handleChatPress} />}
            keyExtractor={item => item.id}
            scrollEnabled={false} // Disable inner scrolling, let outer ScrollView handle it
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
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
});

export default AllChatsScreen;
