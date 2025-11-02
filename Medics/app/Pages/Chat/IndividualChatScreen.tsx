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
  ActivityIndicator,
  Alert,
  Linking,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../../Navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as DocumentPicker from 'expo-document-picker';

type IndividualChatScreenRouteProp = RouteProp<RootStackParamList, 'IndividualChatScreen'>;

const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL || 'http://10.10.112.140:4000';

// --- Types ---

type Message = {
  id: string;
  text: string;
  time: string;
  sender: 'patient' | 'doctor';
  createdAt: string;
  file?: {
    id: string;
    name: string;
    mimeType: string;
    size: number;
    url: string;
  } | null;
};

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
    <Image 
      source={{ uri: doctorAvatar || 'https://via.placeholder.com/150' }} 
      style={styles.chatHeaderAvatar} 
    />
    <View style={styles.chatHeaderInfo}>
      <Text style={styles.chatHeaderName}>{String(doctorName || 'Doctor')}</Text>
      <Text style={styles.chatHeaderSpeciality}>{String(doctorSpeciality || 'Specialist')}</Text>
    </View>
  </View>
);

/**
 * Renders a single message bubble
 */
const MessageBubble: React.FC<{ 
  message: Message; 
  doctorAvatar: string;
  doctorName: string;
}> = ({ message, doctorAvatar, doctorName }) => {
  const isPatient = message.sender === 'patient';
  
  const formatFileSize = (bytes: number | undefined | null): string => {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string | null | undefined) => {
    if (!mimeType) return 'document';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'videocam';
    if (mimeType.includes('pdf')) return 'document-text';
    return 'document';
  };

  const handleFilePress = async (fileId: string, fileName: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login to view files');
        return;
      }

      const downloadUrl = `${BACKEND_URL}/api/files/medical/${fileId}/download?token=${token}`;
      
      const supported = await Linking.canOpenURL(downloadUrl);
      if (supported) {
        await Linking.openURL(downloadUrl);
      } else {
        Alert.alert('Error', 'Cannot open this file type');
      }
    } catch (error) {
      console.error('Error opening file:', error);
      Alert.alert('Error', 'Failed to open file');
    }
  };

  return (
    <View style={[styles.messageRow, isPatient ? styles.userMessageRow : styles.doctorMessageRow]}>
      {!isPatient && (
        <Image 
          source={{ uri: doctorAvatar || 'https://via.placeholder.com/150' }} 
          style={styles.messageAvatar} 
        />
      )}
      <View style={[styles.messageBubble, isPatient ? styles.userBubble : styles.doctorBubble]}>
        {!isPatient && (
          <Text style={styles.messageDoctorName}>{String(doctorName || 'Doctor')}</Text>
        )}
        {message.file && (
          <TouchableOpacity 
            style={[
              styles.fileAttachment,
              isPatient ? styles.fileAttachmentPatient : styles.fileAttachmentDoctor
            ]}
            onPress={() => handleFilePress(String(message.file!.id), String(message.file!.name))}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={getFileIcon(message.file.mimeType)} 
              size={28} 
              color={isPatient ? '#FFFFFF' : MAIN_GREEN} 
            />
            <View style={styles.fileInfo}>
              <Text style={[
                styles.fileName, 
                { color: isPatient ? '#FFFFFF' : TEXT_PRIMARY }
              ]} numberOfLines={1}>
                {String(message.file.name || 'Unknown file')}
              </Text>
              <Text style={[
                styles.fileSize, 
                { color: isPatient ? '#FFFFFF' : TEXT_SECONDARY }
              ]}>
                {String(formatFileSize(message.file.size))}
              </Text>
            </View>
            <Ionicons 
              name="download-outline" 
              size={20} 
              color={isPatient ? '#FFFFFF' : MAIN_GREEN} 
            />
          </TouchableOpacity>
        )}
        {message.text && (
          <Text style={[
            styles.messageText, 
            isPatient ? styles.userText : styles.doctorText,
            message.file && { marginTop: 6 }
          ]}>
            {String(message.text)}
          </Text>
        )}
      </View>
      <Text style={[styles.messageTime, isPatient ? styles.userTime : styles.doctorTime]}>
        {String(message.time || '')}
      </Text>
    </View>
  );
};

// --- Main Individual Chat Screen Component ---

const IndividualChatScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<IndividualChatScreenRouteProp>();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Get doctor info from route params or use defaults
  const doctorInfo = {
    chatId: route.params?.chatId || '',
    doctorId: route.params?.doctorId || '1',
    doctorName: String(route.params?.doctorName || 'Dr. Sarah Johnson'),
    doctorSpeciality: String(route.params?.doctorSpeciality || '4.7 ⭐ General Physician'),
    doctorAvatar: String(route.params?.doctorAvatar || 'https://i.ibb.co/L8G2JvM/female-doctor-avatar.png'),
  };

  // Fetch messages
  const fetchMessages = async () => {
    try {
      if (!doctorInfo.chatId) {
        setLoading(false);
        return;
      }

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.warn('No token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/chats/${doctorInfo.chatId}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        console.error('Failed to fetch messages:', response.status);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch messages on mount and poll every 3 seconds
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [doctorInfo.chatId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Back navigation
  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSendMessage = async () => {
    if (message.trim() && !sending) {
      const messageText = message.trim();
      setMessage('');
      setSending(true);

      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.warn('No token found');
          setSending(false);
          return;
        }

        const response = await fetch(`${BACKEND_URL}/api/chats/${doctorInfo.chatId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: messageText }),
        });

        if (response.ok) {
          // Immediately fetch new messages
          await fetchMessages();
        } else {
          console.error('Failed to send message:', response.status);
          // Restore message on error
          setMessage(messageText);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        setMessage(messageText);
      } finally {
        setSending(false);
      }
    }
  };

  const handleAttachFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      
      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp',
        'application/pdf'
      ];

      const fileType = file.mimeType?.toLowerCase() || '';
      const fileName = file.name?.toLowerCase() || '';
      
      // Check by MIME type or file extension
      const isValidType = allowedTypes.includes(fileType) || 
                          fileName.match(/\.(jpg|jpeg|png|gif|webp|bmp|pdf)$/);

      if (!isValidType) {
        Alert.alert(
          'Invalid File Type',
          'Only images (JPEG, PNG, GIF, WebP, BMP) and PDF files are allowed.'
        );
        return;
      }
      
      // Check file size (10MB limit)
      if (file.size && file.size > 10 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Please select a file smaller than 10MB');
        return;
      }

      setSending(true);

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login to upload files');
        setSending(false);
        return;
      }

      // Create FormData
      const formData = new FormData();
      
      // For React Native, ensure the URI is properly formatted
      let fileUri = file.uri;
      
      // On Android, remove file:// prefix if present
      if (Platform.OS === 'android' && fileUri.startsWith('file://')) {
        fileUri = fileUri;
      } else if (Platform.OS === 'ios' && !fileUri.startsWith('file://')) {
        fileUri = 'file://' + fileUri;
      }
      
      // Format file object for React Native FormData
      const fileToUpload: any = {
        uri: fileUri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
      };
      
      console.log('File to upload:', fileToUpload);
      
      formData.append('file', fileToUpload);
      
      if (message.trim()) {
        formData.append('text', message.trim());
        setMessage('');
      }

      console.log('Uploading to:', `${BACKEND_URL}/api/chats/${doctorInfo.chatId}/upload`);

      // Use XMLHttpRequest for better file upload support in React Native
      const uploadPromise = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        
        xhr.onerror = () => reject(new Error('Network request failed'));
        xhr.ontimeout = () => reject(new Error('Upload timed out'));
        
        xhr.open('POST', `${BACKEND_URL}/api/chats/${doctorInfo.chatId}/upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.timeout = 60000; // 60 second timeout
        
        xhr.send(formData);
      });

      const responseData: any = await uploadPromise;
      console.log('Upload response:', responseData);

      if (responseData.success) {
        await fetchMessages();
        Alert.alert('Success', 'File uploaded successfully');
      } else {
        Alert.alert('Upload Failed', responseData.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again';
      Alert.alert('Error', `Failed to upload file: ${errorMessage}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ChatHeader
        doctorName={doctorInfo.doctorName}
        doctorSpeciality={doctorInfo.doctorSpeciality}
        doctorAvatar={doctorInfo.doctorAvatar}
        onBackPress={handleBackPress}
      />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Date separator, if needed */}
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>Messages</Text>
          </View>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={MAIN_GREEN} />
              <Text style={styles.loadingText}>Loading messages...</Text>
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color={TEXT_SECONDARY} />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Start the conversation!</Text>
            </View>
          ) : (
            messages.map(msg => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                doctorAvatar={doctorInfo.doctorAvatar}
                doctorName={doctorInfo.doctorName}
              />
            ))
          )}
        </ScrollView>

        <View style={styles.inputArea}>
          <TouchableOpacity style={styles.inputActionButton} onPress={handleAttachFile} disabled={sending}>
            <Ionicons name="attach-outline" size={24} color={sending ? TEXT_SECONDARY : MAIN_GREEN} />
          </TouchableOpacity>
          <TextInput
            style={styles.messageInput}
            placeholder="Type your message..."
            placeholderTextColor={TEXT_SECONDARY}
            value={message}
            onChangeText={setMessage}
            multiline={true} // Allow multiple lines
            editable={!sending}
          />
          <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton} disabled={sending}>
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
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
    paddingTop: 15,
    paddingHorizontal: 10,
    paddingBottom: 20,
    flexGrow: 1,
  },
  dateSeparator: {
    alignSelf: 'center',
    backgroundColor: BORDER_COLOR,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginVertical: 12,
    marginBottom: 20, 
    // More space after the separator
  },
  dateSeparatorText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Align bubble bottoms
    marginBottom: 12, 
    marginHorizontal: 5, 
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
  fileAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
    minHeight: 60,
  },
  fileAttachmentPatient: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)', // Darker overlay for green bubbles
  },
  fileAttachmentDoctor: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)', // Light green tint for white bubbles
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
  },
  fileSize: {
    fontSize: 11,
    marginTop: 3,
    opacity: 0.9,
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
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 10 : 15,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
    marginHorizontal: 8, // Space on both sides (attach button and send button)
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: TEXT_SECONDARY,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
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

export default IndividualChatScreen;

