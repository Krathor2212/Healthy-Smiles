import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../../Navigation/types';

type IndividualChatScreenRouteProp = RouteProp<RootStackParamList, 'IndividualChatScreen'>;

// --- Types ---

type Message = {
  id: string;
  text: string;
  time: string;
  sender: 'user' | 'doctor';
  doctorName?: string; // Only for doctor messages
  doctorAvatar?: string; // Only for doctor messages
};

// --- Mock Data ---
// Replace this with your API data
const CHAT_MESSAGES: Message[] = [
  {
    id: '1',
    text: 'Hello doctor, I have a question about my medication',
    time: '10:31 AM',
    sender: 'user',
  },
  {
    id: '2',
    text: 'Of course! What would you like to know?',
    time: '10:31 AM',
    sender: 'doctor',
    doctorName: 'Dr. Sarah Johnson',
    doctorAvatar: 'https://i.ibb.co/L8G2JvM/female-doctor-avatar.png',
  },
  {
    id: '3',
    text: 'Okay, see then!',
    time: '10:31 AM',
    sender: 'doctor',
    doctorName: 'Dr. Michael Chen',
    doctorAvatar: 'https://i.ibb.co/r760Vd0/male-doctor-avatar.png',
  },
  {
    id: '4',
    text: 'Of course! What would you like to know?',
    time: '10:31 AM',
    sender: 'doctor',
    doctorName: 'Dr. Sarah Johnson',
    doctorAvatar: 'https://i.ibb.co/L8G2JvM/female-doctor-avatar.png',
  },
  {
    id: '5',
    text: 'Enengend for I Okat your like to know',
    time: '10:31 AM',
    sender: 'doctor',
    doctorName: 'Dr. Michael Chen',
    doctorAvatar: 'https://i.ibb.co/r760Vd0/male-doctor-avatar.png',
  },
  {
    id: '6',
    text: 'Okay, see then!',
    time: '10:31 AM',
    sender: 'doctor',
    doctorName: 'Dr. Sarah Johnson',
    doctorAvatar: 'https://i.ibb.co/L8G2JvM/female-doctor-avatar.png',
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
 * Placeholder for your existing AppHeader, modified for individual chat.
 * This header now displays the contact's info and call/video icons.
 */
const ChatHeader: React.FC<{
  doctorName: string;
  doctorSpeciality: string;
  doctorAvatar: string;
  onBackPress: () => void;
}> = ({ doctorName, doctorSpeciality, doctorAvatar, onBackPress }) => (
  <View style={styles.chatHeaderContainer}>
    <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
      <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
    </TouchableOpacity>
    <Image source={{ uri: doctorAvatar }} style={styles.chatHeaderAvatar} />
    <View style={styles.chatHeaderInfo}>
      <Text style={styles.chatHeaderName}>{doctorName}</Text>
      <Text style={styles.chatHeaderSpeciality}>{doctorSpeciality}</Text>
    </View>
  </View>
);

/**
 * Renders a single message bubble
 */
const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.sender === 'user';
  return (
    <View style={[styles.messageRow, isUser ? styles.userMessageRow : styles.doctorMessageRow]}>
      {!isUser && message.doctorAvatar && (
        <Image source={{ uri: message.doctorAvatar }} style={styles.messageAvatar} />
      )}
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.doctorBubble]}>
        {!isUser && message.doctorName && (
          <Text style={styles.messageDoctorName}>{message.doctorName}</Text>
        )}
        <Text style={[styles.messageText, isUser ? styles.userText : styles.doctorText]}>
          {message.text}
        </Text>
      </View>
      <Text style={[styles.messageTime, isUser ? styles.userTime : styles.doctorTime]}>
        {message.time}
      </Text>
    </View>
  );
};

// --- Main Individual Chat Screen Component ---

const IndividualChatScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<IndividualChatScreenRouteProp>();
  const [message, setMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Get doctor info from route params or use defaults
  const doctorInfo = route.params || {
    doctorId: '1',
    doctorName: 'Dr. Sarah Johnson',
    doctorSpeciality: '4.7 ⭐ General Physician',
    doctorAvatar: 'https://i.ibb.co/L8G2JvM/female-doctor-avatar.png',
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [CHAT_MESSAGES]); // In a real app, this would be `messages` state

  // Back navigation
  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      // In a real app, you'd add this message to state/API
      setMessage('');
    }
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={BG_LIGHT_GRAY} />
      <ChatHeader
        doctorName={doctorInfo.doctorName}
        doctorSpeciality={doctorInfo.doctorSpeciality}
        doctorAvatar={doctorInfo.doctorAvatar}
        onBackPress={handleBackPress}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Adjust as needed
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Date separator, if needed */}
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>Message</Text>
          </View>
          {CHAT_MESSAGES.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </ScrollView>

        <View style={styles.inputArea}>
          <TouchableOpacity style={styles.inputActionButton}>
            <Ionicons name="attach-outline" size={24} color={TEXT_SECONDARY} />
          </TouchableOpacity>
          <TextInput
            style={styles.messageInput}
            placeholder="Type your message..."
            placeholderTextColor={TEXT_SECONDARY}
            value={message}
            onChangeText={setMessage}
            multiline={true} // Allow multiple lines
          />
          <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_LIGHT_GRAY,
  },
  // Chat Header
  chatHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  backButton: {
    marginRight: 10,
    padding: 5, // Make touch target larger
  },
  chatHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: BORDER_COLOR,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
  },
  chatHeaderSpeciality: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },

  // Chat Bubbles
  chatContainer: {
    flex: 1,
    backgroundColor: BG_LIGHT_GRAY,
  },
  chatContentContainer: {
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  dateSeparator: {
    alignSelf: 'center',
    backgroundColor: BORDER_COLOR,
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginVertical: 15,
  },
  dateSeparatorText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Align bubble bottoms
    marginBottom: 10,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
    marginLeft: 'auto', // Push to right
  },
  doctorMessageRow: {
    justifyContent: 'flex-start',
    marginRight: 'auto', // Push to left
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    backgroundColor: BORDER_COLOR,
  },
  messageBubble: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 18,
    maxWidth: '75%',
    flexDirection: 'column', // To stack name and text
  },
  userBubble: {
    backgroundColor: MAIN_GREEN,
    borderBottomRightRadius: 4, // Sharp corner for user side
  },
  doctorBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4, // Sharp corner for doctor side
  },
  messageDoctorName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: TEXT_SECONDARY,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  doctorText: {
    color: TEXT_PRIMARY,
  },
  messageTime: {
    fontSize: 10,
    color: TEXT_SECONDARY,
    marginTop: 2, // Small gap from bubble
    marginHorizontal: 5,
  },
  userTime: {
    alignSelf: 'flex-end', // Align time to the bottom of the bubble on user side
    color: '#888', // Slightly darker for contrast
  },
  doctorTime: {
    alignSelf: 'flex-end', // Align time to the bottom of the bubble on doctor side
    color: '#888', // Slightly darker for contrast
  },

  // Input Area
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
  },
  inputActionButton: {
    padding: 8,
  },
  messageInput: {
    flex: 1,
    backgroundColor: BG_LIGHT_GRAY,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    minHeight: 40,
    maxHeight: 120, // Prevent input from growing too large
    marginHorizontal: 8,
    fontSize: 16,
    color: TEXT_PRIMARY,
  },
  sendButton: {
    backgroundColor: MAIN_GREEN,
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
});

export default IndividualChatScreen;

