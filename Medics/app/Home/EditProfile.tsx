import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppHeader from '../components/AppHeader';
import type { RootStackParamList } from '../Navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

type UserProfile = {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  stats?: {
    heartRate?: string;
    calories?: string;
    weight?: string;
  };
};

const STORAGE_KEY = 'userProfile';

export default function EditProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [profile, setProfile] = useState<UserProfile>({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as UserProfile;
          setProfile((p) => ({ ...p, ...parsed }));
        } else {
          // sensible defaults
          setProfile({ name: 'Amelia Renata', email: 'amelia@example.com', phone: '+1 555 123 4567', stats: { heartRate: '215bpm', calories: '756cal', weight: '103lbs' } });
        }
      } catch (e) {
        console.warn('Failed to load profile', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      navigation.goBack();
    } catch (e) {
      console.warn('Failed to save profile', e);
      Alert.alert('Error', 'Failed to save profile.');
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

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={profile.email} onChangeText={(t) => setProfile((p) => ({ ...p, email: t }))} placeholder="Email" keyboardType="email-address" />

          <Text style={styles.label}>Phone</Text>
          <TextInput style={styles.input} value={profile.phone} onChangeText={(t) => setProfile((p) => ({ ...p, phone: t }))} placeholder="Phone" keyboardType="phone-pad" />

          <Text style={[styles.sectionTitle, { marginTop: 6 }]}>Health details</Text>
          <Text style={styles.label}>Heart rate</Text>
          <TextInput style={styles.input} value={profile.stats?.heartRate ?? ''} onChangeText={(t) => setProfile((p) => ({ ...p, stats: { ...(p.stats || {}), heartRate: t } }))} placeholder="e.g. 72bpm" />

          <Text style={styles.label}>Calories</Text>
          <TextInput style={styles.input} value={profile.stats?.calories ?? ''} onChangeText={(t) => setProfile((p) => ({ ...p, stats: { ...(p.stats || {}), calories: t } }))} placeholder="e.g. 756cal" />

          <Text style={styles.label}>Weight</Text>
          <TextInput style={styles.input} value={profile.stats?.weight ?? ''} onChangeText={(t) => setProfile((p) => ({ ...p, stats: { ...(p.stats || {}), weight: t } }))} placeholder="e.g. 70kg" />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="checkmark" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.saveText}>Save</Text>
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
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginTop: 12 },
  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#00C4CC', paddingVertical: 12, borderRadius: 10, marginTop: 8 },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
