import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { StackNavigationProp } from '@react-navigation/stack';
import * as DocumentPicker from "expo-document-picker";
import React, { useEffect, useState, useCallback } from "react";
import {
    Animated,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
    ActivityIndicator
} from "react-native";
import AppHeader from "../../components/AppHeader";
import NotificationBell from "../../components/NotificationBell";
import { RootStackParamList } from "../../Navigation/types";
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL || 'http://10.10.112.140:4000';

type MedicalFile = {
  id: string;
  name: string;
  uri: string;
  size: number;
  mimeType: string | null;
  createdAt: string;
};

export default function MedicalFileManagerScreen() {
  const [files, setFiles] = useState<MedicalFile[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingFile, setEditingFile] = useState<MedicalFile | null>(null);
  const [labelInput, setLabelInput] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const handleBackPress = () => navigation.goBack();

  // Fetch files from backend
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Error', 'Please login to view medical files');
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/files/medical`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setFiles(data.files || []);
      } else {
        Alert.alert('Error', data.error || 'Failed to load files');
      }
    } catch (error) {
      console.error('Fetch files error:', error);
      Alert.alert('Error', 'Failed to load medical files');
    } finally {
      setLoading(false);
    }
  };

  // Refresh files when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchFiles();
    }, [])
  );

  const showToast = (msg: string) => {
    setSuccessMessage(msg);
    Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      }, 1500);
    });
  };

  const handleAddFile = async () => {
    try {
      // First check if we can reach the backend
      console.log('Backend URL:', BACKEND_URL);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const doc = result.assets[0];

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

      const fileType = doc.mimeType?.toLowerCase() || '';
      const fileName = doc.name?.toLowerCase() || '';
      
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

      // Check file size (10MB limit to match backend)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (doc.size && doc.size > maxSize) {
        Alert.alert('File Too Large', 'Maximum file size is 10MB');
        return;
      }

      // Upload to backend
      setUploading(true);
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        Alert.alert('Error', 'Please login to upload files');
        setUploading(false);
        return;
      }

      console.log('Token found, uploading file...');
      console.log('File details:', {
        name: doc.name,
        size: doc.size,
        type: doc.mimeType,
        uri: doc.uri.substring(0, 50) + '...'
      });

      const formData = new FormData();
      formData.append('file', {
        uri: doc.uri,
        name: doc.name,
        type: doc.mimeType || 'application/octet-stream'
      } as any);

      console.log('Uploading file:', {
        name: doc.name,
        size: doc.size,
        type: doc.mimeType,
        uri: doc.uri
      });

      const uploadUrl = `${BACKEND_URL}/api/files/medical/upload`;
      console.log('Upload URL:', uploadUrl);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Note: Don't set Content-Type for FormData, let the browser set it with boundary
        },
        body: formData
      });

      console.log('Upload response status:', response.status);
      const data = await response.json();
      console.log('Upload response data:', data);

      if (response.ok) {
        showToast('File uploaded successfully (encrypted)');
        fetchFiles(); // Refresh file list
      } else {
        Alert.alert('Upload Failed', data.error || 'Failed to upload file');
        console.error('Upload failed:', data);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      Alert.alert('Error', `Failed to upload file: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (file: MedicalFile) => {
    Alert.alert(
      'Delete File',
      `Are you sure you want to delete "${file.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              
              const response = await fetch(`${BACKEND_URL}/api/files/medical/${file.id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });

              const data = await response.json();

              if (response.ok) {
                showToast('File deleted successfully');
                fetchFiles(); // Refresh file list
              } else {
                Alert.alert('Error', data.error || 'Failed to delete file');
              }
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete file');
            }
          }
        }
      ]
    );
  };

  const handleDownload = async (file: MedicalFile) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      showToast('Downloading file...');
      
      const response = await fetch(`${BACKEND_URL}${file.uri}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showToast('File downloaded successfully');
        // In a real app, you'd save the file to device storage
      } else {
        Alert.alert('Error', 'Failed to download file');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download file');
    }
  };

  const renderFile = ({ item }: { item: MedicalFile }) => (
    <View style={styles.fileRow}>
      <View style={[styles.fileInfo, { flex: 1 }]}>
        <Ionicons name="document-text-outline" size={22} color="#007AFF" />
        <View style={{ marginLeft: 8, flex: 1 }}>
          <Text style={styles.fileName} numberOfLines={2} ellipsizeMode="tail">
            {item.name}
          </Text>
          <Text style={styles.fileMeta}>
            {typeof item.size === "number" ? `${(item.size / 1048576).toFixed(2)} MB` : "—"}
            {item.createdAt && ` • ${new Date(item.createdAt).toLocaleDateString()}`}
          </Text>
          <View style={styles.encryptionBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#28a745" />
            <Text style={styles.encryptionText}>Encrypted</Text>
          </View>
        </View>
      </View>
      <View style={styles.fileActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDownload(item)}
        >
          <Ionicons name="download-outline" size={18} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={18} color="#d00" />
        </TouchableOpacity>
      </View>
    </View>
  );


  return (
    <View style={styles.container}>
      <AppHeader 
        title="Medical Records" 
        onBack={handleBackPress}
        right={<NotificationBell onPress={() => navigation.navigate('Notifications')} />}
      />

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="shield-checkmark" size={20} color="#28a745" />
        <Text style={styles.infoBannerText}>
          All files are encrypted with El Gamal encryption
        </Text>
      </View>

      {/* Add File Button */}
      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={[styles.addButton, uploading && styles.disabledButton]} 
          onPress={handleAddFile}
          disabled={uploading || loading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Upload File (Max 50MB)</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading files...</Text>
        </View>
      ) : files.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="folder-open-outline" size={50} color="#aaa" />
          <Text style={styles.emptyText}>No medical files yet</Text>
          <Text style={styles.emptySubtext}>
            Upload your medical records, lab reports, and prescriptions
          </Text>
        </View>
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item) => item.id}
          renderItem={renderFile}
          contentContainerStyle={{ gap: 10, marginTop: 12, paddingBottom: 20 }}
        />
      )}

      {/* Success Toast */}
      {successMessage ? (
        <Animated.View
          style={{
            opacity: fadeAnim,
            position: "absolute",
            bottom: 40,
            alignSelf: "center",
            backgroundColor: "#007AFF",
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>{successMessage}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f7ed',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 10,
    gap: 8,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#28a745',
    fontWeight: '600',
  },

  actionRow: {
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center',
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: "#a0c4ff",
  },
  addButtonText: { 
    color: "#fff", 
    fontWeight: "600",
    fontSize: 15,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },

  empty: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center", 
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyText: { 
    color: "#333",
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  fileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  fileInfo: { 
    flexDirection: "row", 
    alignItems: "flex-start",
  },
  fileName: { 
    fontSize: 14, 
    fontWeight: "600",
    color: '#333',
    marginBottom: 4,
  },
  fileMeta: { 
    fontSize: 11, 
    color: "#888",
    marginBottom: 4,
  },
  encryptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  encryptionText: {
    fontSize: 10,
    color: '#28a745',
    fontWeight: '600',
  },
  fileActions: { 
    flexDirection: "row", 
    alignItems: "center",
    gap: 6,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
});
