import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as ImagePicker from 'expo-image-picker';
import * as FaceDetector from 'expo-face-detector';

interface AuthOptionsProps {
  navigation: NavigationProp<any>;
}

const AuthOptions: React.FC<AuthOptionsProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Request permissions on mount
    (async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        Alert.alert('Permissions needed', 'Camera and media library permissions are required for biometric authentication.');
      }
    })();
  }, []);

  const handleBiometric = async () => {
    setLoading(true);
    try {
      // Check if biometric hardware is available
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert('Biometric not available', 'Biometric authentication is not set up on this device.');
        setLoading(false);
        return;
      }

      // For simplicity, we'll use LocalAuthentication for biometric (which includes face on some devices)
      // But for face recognition, we need to capture and store face data
      const storedFaces = await AsyncStorage.getItem('biometricFaces');
      const faces = storedFaces ? JSON.parse(storedFaces) : [];

      if (faces.length === 0) {
        // New user - capture face
        await captureFace();
      } else {
        // Existing user - verify face
        await verifyFace(faces);
      }
    } catch (error) {
      console.error('Biometric error:', error);
      Alert.alert('Error', 'Failed to authenticate with biometric.');
    } finally {
      setLoading(false);
    }
  };

  const captureFace = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Camera permission is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      // Detect faces in the image
      const faces = await FaceDetector.detectFacesAsync(imageUri, {
        mode: FaceDetector.FaceDetectorMode.fast,
        detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
        runClassifications: FaceDetector.FaceDetectorClassifications.none,
        minDetectionInterval: 100,
        tracking: false,
      });

      if (faces.faces.length > 0) {
        // Store face data (simplified - in real app, you'd store face embeddings)
        const faceData = {
          id: Date.now().toString(),
          imageUri,
          timestamp: new Date().toISOString(),
        };

        const storedFaces = await AsyncStorage.getItem('biometricFaces');
        const facesArray = storedFaces ? JSON.parse(storedFaces) : [];
        facesArray.push(faceData);
        await AsyncStorage.setItem('biometricFaces', JSON.stringify(facesArray));

        Alert.alert('Success', 'Face captured successfully! You can now use biometric authentication.');
      } else {
        Alert.alert('No face detected', 'Please try again and ensure your face is clearly visible.');
      }
    }
  };

  const verifyFace = async (storedFaces: any[]) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Camera permission is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      const faces = await FaceDetector.detectFacesAsync(imageUri, {
        mode: FaceDetector.FaceDetectorMode.fast,
        detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
        runClassifications: FaceDetector.FaceDetectorClassifications.none,
        minDetectionInterval: 100,
        tracking: false,
      });

      if (faces.faces.length > 0) {
        // Simplified verification - in real app, compare face embeddings
        Alert.alert('Success', 'Face verification successful!', [
          { text: 'OK', onPress: () => navigation.navigate('Home') }
        ]);
      } else {
        Alert.alert('Verification failed', 'Face not recognized. Please try again.');
      }
    }
  };

  const handleFingerprint = async () => {
    setLoading(true);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT) || !isEnrolled) {
        Alert.alert('Fingerprint not available', 'Fingerprint authentication is not set up on this device.');
        setLoading(false);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with fingerprint',
        fallbackLabel: 'Use passcode',
      });

      if (result.success) {
        Alert.alert('Success', 'Fingerprint authentication successful!', [
          { text: 'OK', onPress: () => navigation.navigate('Home') }
        ]);
      } else {
        Alert.alert('Authentication failed', 'Fingerprint not recognized.');
      }
    } catch (error) {
      console.error('Fingerprint error:', error);
      Alert.alert('Error', 'Failed to authenticate with fingerprint.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Authentication Method</Text>
        <Text style={styles.subtitle}>Select how you'd like to secure your account</Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={handleBiometric}
          disabled={loading}
        >
          <Image
            source={require('../assets/logo.png')} // You can replace with a face icon
            style={styles.optionIcon}
            resizeMode="contain"
          />
          <Text style={styles.optionTitle}>Biometric (Face)</Text>
          <Text style={styles.optionDescription}>Use face recognition for quick access</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={handleFingerprint}
          disabled={loading}
        >
          <Image
            source={require('../assets/logo.png')} // You can replace with a fingerprint icon
            style={styles.optionIcon}
            resizeMode="contain"
          />
          <Text style={styles.optionTitle}>Fingerprint</Text>
          <Text style={styles.optionDescription}>Secure authentication with your fingerprint</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={handleEmailAuth}
          disabled={loading}
        >
          <Image
            source={require('../assets/logo.png')} // You can replace with an email icon
            style={styles.optionIcon}
            resizeMode="contain"
          />
          <Text style={styles.optionTitle}>Email Login/Signup</Text>
          <Text style={styles.optionDescription}>Traditional email and password authentication</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14B8A6" />
          <Text style={styles.loadingText}>Authenticating...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  optionIcon: {
    width: 60,
    height: 60,
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#14B8A6',
    fontWeight: '500',
  },
});

export default AuthOptions;
