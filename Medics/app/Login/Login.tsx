import { AntDesign, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp } from '@react-navigation/native';
import Constants from 'expo-constants';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image, Keyboard, KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen({ navigation }: { navigation: NavigationProp<any> }) {
  // Default role set to 'patient' — role selection removed
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState('');

  // --- Handlers ---
  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const backend = (Constants.expoConfig?.extra?.BACKEND_URL || (Constants.manifest as any)?.extra?.BACKEND_URL) || 'http://10.11.146.215:4000';
      const resp = await fetch(`${backend.replace(/\/$/, '')}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'patient', email, password }),
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        // backend error message expected in data.message
        const msg = data?.message || 'Login failed';
        setError(msg);
        return;
      }

      // Expecting { token: '...' } or similar
      const token = data?.token ?? data?.accessToken;
      if (!token) {
        setError('Authentication succeeded but no token returned');
        return;
      }

      // persist token and session
      try {
        await AsyncStorage.setItem('token', token);
        // mark that the user has an active session (used to show biometric next launches)
        await AsyncStorage.setItem('hasSession', 'true');
        // per request: persist password (insecure). It's better to use SecureStore in production.
        await AsyncStorage.setItem('savedPassword', password);
        // save email for auto-login
        await AsyncStorage.setItem('savedEmail', email);
      } catch (e) {
        // non-fatal, still proceed
        console.warn('Failed to save token/session', e);
      }

      // Reset navigation stack to Home so back button cannot return to Login
      navigation.reset({ index: 0, routes: [{ name: 'Home' as any }] });
    } catch (err: any) {
      Alert.alert('Network error', err?.message || 'Unable to reach server');
    } finally {
      setLoading(false);
    }
  };

  const backScale = useRef(new Animated.Value(1)).current;
  const headerSlide = useRef(new Animated.Value(0)).current; // 0 => hidden, 1 => shifted
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      Animated.timing(headerSlide, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(headerSlide, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [headerSlide]);
  const onBackPressIn = () => Animated.spring(backScale, { toValue: 0.93, useNativeDriver: true }).start();
  const onBackPressOut = () => Animated.spring(backScale, { toValue: 1, useNativeDriver: true }).start();
  const handleBack = () => {
    navigation.goBack();
  };

  const handleGoogleSignIn = () => {
    console.log('Attempting Google Sign-In...');
    // Add your Google Sign-In logic here
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff" // make status bar background match screen
        translucent={false}      // ensure content is placed below the status bar on Android
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
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
        {/* Centered logo aligned with back button */}
        <View style={styles.topCenter} pointerEvents="none">
          <Image source={require('../../assets/logo.png')} style={styles.topLogo} resizeMode="contain" />
        </View>
        <Animated.View
          style={[
            styles.header,
            { transform: [
              { translateX: headerSlide.interpolate({ inputRange: [0, 1], outputRange: [0, 18] }) },
              { translateY: headerSlide.interpolate({ inputRange: [0, 1], outputRange: [0, 6] }) },
            ] },
          ]}
        >
          <Text style={styles.title}>Login</Text>
        </Animated.View>

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
        <View style={[styles.inputContainer, error ? styles.inputError : null]}>
          <MaterialCommunityIcons name="lock-outline" size={22} color={error ? '#E53E3E' : '#888'} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            secureTextEntry={!isPasswordVisible}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#888"
          />
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <Feather name={isPasswordVisible ? "eye-off" : "eye"} size={22} color={error ? '#E53E3E' : '#888'} />
          </TouchableOpacity>
        </View>
        
        {/* --- Error Message & Forgot Password --- */}
        <View style={styles.actionsContainer}>
            {error ? <Text style={styles.errorText}>{error}</Text> : <View />}
            <TouchableOpacity>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
        </View>

        {/* --- Login Button --- */}
        <TouchableOpacity
          style={[styles.loginButton, loading && { opacity: 0.85 }]}
          onPress={handleLogin}
          disabled={loading}
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* --- Sign Up Link --- */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <Pressable
            onPress={() => navigation.navigate('SignUp')}
            android_ripple={{ color: 'rgba(20,184,166,0.12)', borderless: false }}
            accessibilityRole="button"
            accessibilityLabel="Sign up"
            style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}
          >
            <Text style={[styles.signupText, styles.signupLink]}>Sign Up</Text>
          </Pressable>
        </View>
        
        {/* --- Divider --- */}
        <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
        </View>

        {/* --- Google Sign-In Button --- */}
        <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn}>
          <AntDesign name="google" size={24} color="#333" />
          <Text style={styles.socialButtonText}>Sign in with Google</Text>
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
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
  inputError: {
    borderColor: '#E53E3E', // Red border for error
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A202C',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    minHeight: 20, // To prevent layout shift when error appears
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 13,
  },
  forgotPasswordText: {
    color: '#14B8A6',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#14B8A6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#4A5568',
  },
  signupLink: {
    color: '#14B8A6',
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#CBD5E0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#A0AEC0',
    fontSize: 14,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 16,
  },
  socialButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#2D3748',
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
  topCenter: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 46 : 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  topLogo: {
    width: 240,
    height: 72,
  },
});