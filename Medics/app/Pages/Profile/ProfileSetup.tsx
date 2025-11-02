import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import Constants from 'expo-constants';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../Navigation/types';

const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL || 'http://10.10.112.140:4000';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function ProfileSetupScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dob: '',
    height: '',
    weight: '',
  });

  const handleComplete = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      Alert.alert('Required Field', 'Please enter your full name');
      return;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Required Field', 'Please enter your phone number');
      return;
    }
    if (!formData.dob.trim()) {
      Alert.alert('Required Field', 'Please enter your date of birth (YYYY-MM-DD)');
      return;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.dob)) {
      Alert.alert('Invalid Date', 'Please enter date in YYYY-MM-DD format (e.g., 1990-01-15)');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Error', 'You are not logged in');
        navigation.navigate('Login');
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert(
          'Profile Completed!',
          'Your profile has been set up successfully',
          [
            {
              text: 'Continue',
              onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Home' as any }] })
            }
          ]
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile setup error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="person-circle-outline" size={80} color="#0091F5" />
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>
              Help us serve you better by completing your profile
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name - Required */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Full Name <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Phone - Required */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Phone Number <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="+1 234-567-8900"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Date of Birth - Required */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Date of Birth <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD (e.g., 1990-01-15)"
                  value={formData.dob}
                  onChangeText={(text) => setFormData({ ...formData, dob: text })}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
              <Text style={styles.hint}>Format: Year-Month-Day</Text>
            </View>

            {/* Height - Optional */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Height (Optional)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="resize-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 170 cm or 5'7&quot;"
                  value={formData.height}
                  onChangeText={(text) => setFormData({ ...formData, height: text })}
                />
              </View>
            </View>

            {/* Weight - Optional */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Weight (Optional)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="fitness-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 70 kg or 154 lbs"
                  value={formData.weight}
                  onChangeText={(text) => setFormData({ ...formData, weight: text })}
                />
              </View>
            </View>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#0091F5" />
            <Text style={styles.infoText}>
              All information is encrypted and kept secure. Fields marked with * are required.
            </Text>
          </View>

          {/* Complete Button */}
          <TouchableOpacity
            style={[styles.completeButton, loading && styles.buttonDisabled]}
            onPress={handleComplete}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.completeButtonText}>Complete Profile</Text>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          {/* Skip Notice */}
          <Text style={styles.skipNotice}>
            You cannot use the app until your profile is completed
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    marginLeft: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e6f7ff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#91d5ff',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#0050b3',
    marginLeft: 8,
  },
  completeButton: {
    backgroundColor: '#0091F5',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#0091F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipNotice: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginTop: 16,
  },
});
