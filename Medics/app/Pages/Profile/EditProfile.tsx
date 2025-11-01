import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import AppHeader from '../../components/AppHeader';
import type { RootStackParamList } from '../../Navigation/types';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL || 'http://10.10.112.140:4000';

type NavigationProp = StackNavigationProp<RootStackParamList>;

type UserProfile = {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  dob?: string;
  height?: string;
  weight?: string;
};

export default function EditProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [profile, setProfile] = useState<UserProfile>({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
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
        setProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          avatar: data.avatar || undefined,
          dob: data.dob || undefined,
          height: data.height || undefined,
          weight: data.weight || undefined,
        });
      } else if (response.status === 401) {
        await AsyncStorage.removeItem('token');
        navigation.navigate('Login');
      } else {
        console.error('Failed to fetch profile:', response.status);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Permission to access media library is required to upload avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selected = result.assets[0];
        const uri = selected.uri;
        if (uri) {
          // optional: resize/crop
          const manipulated = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 600 } }], { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG });
          setProfile((p) => ({ ...p, avatar: manipulated.uri }));
        }
      }
    } catch (e) {
      console.warn('Image pick error', e);
      Alert.alert('Error', 'Could not pick the image.');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Error', 'Please login again');
        navigation.navigate('Login');
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          dob: profile.dob,
          height: profile.height,
          weight: profile.weight,
          avatar: profile.avatar,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else if (response.status === 401) {
        await AsyncStorage.removeItem('token');
        Alert.alert('Session Expired', 'Please login again');
        navigation.navigate('Login');
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AppHeader title="Edit Profile" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarRow}>
          <TouchableOpacity onPress={pickImage} accessible accessibilityLabel="Change avatar">
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={48} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.uploadHint}>Tap to change avatar</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Full name</Text>
          <TextInput style={styles.input} value={profile.name} onChangeText={(t) => setProfile((p) => ({ ...p, name: t }))} placeholder="Full name" />

          <Text style={styles.label}>Email (read-only)</Text>
          <TextInput 
            style={[styles.input, styles.readOnlyInput]} 
            value={profile.email} 
            placeholder="Email" 
            editable={false}
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput style={styles.input} value={profile.phone} onChangeText={(t) => setProfile((p) => ({ ...p, phone: t }))} placeholder="Phone" keyboardType="phone-pad" />

          <Text style={styles.label}>Date of Birth</Text>
          <TextInput style={styles.input} value={profile.dob ?? ''} onChangeText={(t) => setProfile((p) => ({ ...p, dob: t }))} placeholder="e.g. 1990-01-15" />

          <Text style={[styles.sectionTitle, { marginTop: 6 }]}>Health details</Text>
          <Text style={styles.label}>Height</Text>
          <TextInput style={styles.input} value={profile.height ?? ''} onChangeText={(t) => setProfile((p) => ({ ...p, height: t }))} placeholder="e.g. 5'6&quot; or 170cm" />

          <Text style={styles.label}>Weight</Text>
          <TextInput style={styles.input} value={profile.weight ?? ''} onChangeText={(t) => setProfile((p) => ({ ...p, weight: t }))} placeholder="e.g. 70kg" />

          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.saveText}>Save</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  avatarRow: { alignItems: 'center', marginBottom: 8, marginTop: 12 },
  avatar: { width: 110, height: 110, borderRadius: 60, borderWidth: 3, borderColor: '#fff' },
  avatarPlaceholder: { width: 110, height: 110, borderRadius: 60, backgroundColor: '#00C4CC', alignItems: 'center', justifyContent: 'center' },
  uploadHint: { marginTop: 8, color: '#6B7280' },
  form: { marginTop: 16 },
  label: { fontSize: 14, color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, marginBottom: 12, backgroundColor: '#fff' },
  readOnlyInput: { backgroundColor: '#F3F4F6', color: '#6B7280' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginTop: 12 },
  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#00C4CC', paddingVertical: 12, borderRadius: 10, marginTop: 8 },
  saveButtonDisabled: { backgroundColor: '#9CA3AF', opacity: 0.6 },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
