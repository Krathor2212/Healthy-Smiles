import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  StatusBar,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';

interface AuthOptionsProps {
  navigation: NavigationProp<any>;
}

const AuthOptions: React.FC<AuthOptionsProps> = ({ navigation }) => {
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    // Auto-trigger biometric authentication on mount (like BHIM)
    const autoAuthenticate = async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for better UX
      handleBiometricAuth();
    };
    autoAuthenticate();
  }, []);

  const handleBiometricAuth = async () => {
    try {
      // Check biometric availability directly instead of using state
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const isAvailable = compatible && enrolled;
      
      setBiometricAvailable(isAvailable);

      if (!isAvailable) {
        Alert.alert(
          'Biometric Not Available',
          'Please set up biometric authentication in your device settings or use PIN.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Touch the fingerprint sensor',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        navigation.navigate('Home');
      } else {
        Alert.alert('Authentication Failed', 'Please try again.');
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleUsePIN = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Top Section - Fingerprint Icon */}
      <View style={styles.topSection}>
        <Text style={styles.unlockText}>Unlock With Biometrics</Text>
        <TouchableOpacity 
          style={styles.fingerprintIconContainer}
          onPress={handleBiometricAuth}
          activeOpacity={0.7}
        >
          <Ionicons name="finger-print" size={80} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {/* Middle Section - App Info */}
      <View style={styles.middleSection}>
        <View style={styles.appIconContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.appIcon}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.appName}>Healthy Smiles</Text>
        <Text style={styles.unlockAppText}>Unlock Healthy Smiles</Text>
      </View>

      {/* Bottom Section - Instructions and PIN Button */}
      <View style={styles.bottomSection}>
        <Text style={styles.instructionText}>Touch the fingerprint sensor</Text>
        
        <View style={styles.fingerprintSymbolContainer}>
          <Ionicons name="finger-print-outline" size={60} color="#FFFFFF" opacity={0.5} />
        </View>

        <TouchableOpacity 
          style={styles.usePinButton}
          onPress={handleUsePIN}
          activeOpacity={0.7}
        >
          <Text style={styles.usePinText}>Use PIN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  topSection: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  unlockText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 40,
    fontWeight: '500',
  },
  fingerprintIconContainer: {
    padding: 20,
  },
  middleSection: {
    flex: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 50,
    paddingBottom: 30,
  },
  appIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appIcon: {
    width: 60,
    height: 60,
  },
  appName: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20,
    fontWeight: '500',
  },
  unlockAppText: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  bottomSection: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 40,
  },
  instructionText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  fingerprintSymbolContainer: {
    marginVertical: 20,
  },
  usePinButton: {
    backgroundColor: '#5B6EE1',
    paddingHorizontal: 50,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: '#5B6EE1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  usePinText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AuthOptions;
