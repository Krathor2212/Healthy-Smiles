import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const SignUpScreen = () => {
  const backScale = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation();

  const onBackPressIn = () => Animated.spring(backScale, { toValue: 0.93, useNativeDriver: true }).start();
  const onBackPressOut = () => Animated.spring(backScale, { toValue: 1, useNativeDriver: true }).start();
  const handleBack = () => {
    navigation.goBack();
  };

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- Handlers ---
  const handleSignUp = async () => {
    if (!agreedToTerms) {
      Alert.alert('Terms required', 'You must agree to the Terms of Service and Privacy Policy.');
      return;
    }
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Missing fields', 'Please provide name, email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://10.11.146.215:4000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'patient',
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.message || data?.error || 'Registration failed';
        Alert.alert('Signup error', msg);
        return;
      }

      const token = data?.token ?? data?.accessToken;
      if (!token) {
        Alert.alert('Signup error', 'No token received from server');
        return;
      }

      try {
        await AsyncStorage.setItem('token', token);
      } catch (e) {
        console.warn('Failed to persist token', e);
      }

      // navigate into app
      // replace to clear signup stack
      // adjust route name if different in your app
      (navigation as any).replace?.('Home') ?? (navigation as any).navigate?.('Home');
    } catch (err: any) {
      Alert.alert('Network error', err?.message || 'Unable to reach server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexContainer}
      >
        {/* Back button (top-left) */}
        <Animated.View style={[styles.backButtonWrapper, { transform: [{ scale: backScale }] }]}> 
          <Pressable
            onPress={handleBack}
            onPressIn={onBackPressIn}
            onPressOut={onBackPressOut}
            android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <Feather name="chevron-left" size={20} color="#1A202C" />
          </Pressable>
        </Animated.View>

        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Sign Up</Text>
          </View>

          {/* --- Name Input --- */}
          <View style={styles.inputContainer}>
            <Feather name="user" size={22} color="#888" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#888"
            />
          </View>

          {/* --- Email Input --- */}
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="email-outline" size={22} color="#888" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#888"
            />
          </View>

          {/* --- Password Input --- */}
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="lock-outline" size={22} color="#888" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#888"
            />
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
              <Feather name={isPasswordVisible ? "eye-off" : "eye"} size={22} color="#888" />
            </TouchableOpacity>
          </View>

          {/* --- Terms and Conditions Checkbox --- */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity style={styles.checkbox} onPress={() => setAgreedToTerms(!agreedToTerms)}>
              <MaterialCommunityIcons 
                name={agreedToTerms ? 'checkbox-marked' : 'checkbox-blank-outline'} 
                size={24} 
                color={agreedToTerms ? '#14B8A6' : '#A0AEC0'} 
              />
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>
              I agree to the medidoc {' '}
              <Text style={styles.linkText}>Terms of Service</Text> and{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </View>

          {/* --- Sign Up Button --- */}
          <TouchableOpacity
            style={[styles.signUpButton, loading && { opacity: 0.85 }]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signUpButtonText}>Sign Up</Text>}
          </TouchableOpacity>

          {/* --- Sign In Link --- */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity>
              <Text style={[styles.signInText, styles.signInLink]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  flexContainer: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 55,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A202C',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  checkbox: {
    marginRight: 10,
    marginTop: 2, // Align with text better
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
  linkText: {
    color: '#14B8A6',
    textDecorationLine: 'underline',
  },
  signUpButton: {
    backgroundColor: '#14B8A6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signInText: {
    fontSize: 14,
    color: '#4A5568',
  },
  signInLink: {
    color: '#14B8A6',
    fontWeight: '600',
  },
  backButtonWrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    zIndex: 30,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 4 },
    }),
  },
});

export default SignUpScreen;