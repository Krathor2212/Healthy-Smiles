import { Marquee } from '@animatereactnative/marquee';
import { NavigationProp } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions, Image, Platform, Pressable, Animated as RNAnimated, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

// Define MarqueeDirection type locally since it's not exported by the module
type MarqueeDirection = 'horizontal' | 'vertical';

const { width, height } = Dimensions.get('window');

// --- Replace these with your own high-quality images ---
const imageUrls = [
    require('../assets/doctors/ajay.jpg'),
    require('../assets/doctors/sk.jpg'),
    require('../assets/doctors/kamal.jpg'),
    require('../assets/doctors/kalyani.jpg'),
    require('../assets/doctors/vadivelu.jpg'),
    require('../assets/doctors/hari.jpg'),
    require('../assets/doctors/vinith.jpg'),
    require('../assets/doctors/satheesh.jpg'),
    require('../assets/doctors/santhanam.jpg'),
];
    

// Normalize image sources so each entry is either a number (require) or an object { uri: string }
type ImageSource = { uri: string } | number;
const normalizedImages: ImageSource[] = imageUrls.map((entry) => {
    if (typeof entry === 'string') return { uri: entry };
    return entry as number;
});

// Split the images into two columns using normalized sources
const leftColumnImages: ImageSource[] = normalizedImages.filter((_, index) => index % 2 === 0);
const rightColumnImages: ImageSource[] = normalizedImages.filter((_, index) => index % 2 !== 0);

const InvitesScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
    const [currentBgIndex, setCurrentBgIndex] = useState(0);

    // Animated press scale for the button (react-native Animated aliased as RNAnimated)
    const scale = useRef(new RNAnimated.Value(1)).current;
    const onPressIn = () => {
        RNAnimated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
    };
    const onPressOut = () => {
        RNAnimated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    };

    const handleGetStarted = async () => {
        try {
            // If user does not have a saved session yet (first run), go to Login directly
            const hasSession = await AsyncStorage.getItem('hasSession');
            // Treat only explicit 'true' as an existing session
            if (hasSession !== 'true') {
                navigation.navigate('Login');
                return;
            }

            // Require an existing token to show biometric; otherwise go to Login
            const existingToken = await AsyncStorage.getItem('token');
            if (!existingToken) {
                navigation.navigate('Login');
                return;
            }

            // Otherwise, trigger biometric auth as previously implemented
            const compatible = await LocalAuthentication.hasHardwareAsync();
            const enrolled = await LocalAuthentication.isEnrolledAsync();
            const isAvailable = compatible && enrolled;

            if (!isAvailable) {
                navigation.navigate('AuthOptions');
                return;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Touch the fingerprint sensor',
                cancelLabel: 'Cancel',
                disableDeviceFallback: false,
            });

            if (result.success) {
                // on biometric success, prefer existing token; if missing try auto-login with saved creds
                const existingToken = await AsyncStorage.getItem('token');
                if (existingToken) {
                    navigation.navigate('Home');
                    return;
                }

                // attempt auto-login using saved credentials
                const savedEmail = await AsyncStorage.getItem('savedEmail');
                const savedPassword = await AsyncStorage.getItem('savedPassword');
                if (savedEmail && savedPassword) {
                    try {
                        const backend = (require('expo-constants').default.expoConfig?.extra?.BACKEND_URL || (require('expo-constants').default.manifest as any)?.extra?.BACKEND_URL) || 'http://10.11.146.215:4000';
                        const resp = await fetch(`${backend.replace(/\/$/, '')}/login`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ role: 'patient', email: savedEmail, password: savedPassword }),
                        });
                        const data = await resp.json().catch(() => ({}));
                        if (resp.ok && (data?.token || data?.accessToken)) {
                            const token = data?.token ?? data?.accessToken;
                            await AsyncStorage.setItem('token', token);
                            navigation.navigate('Home');
                            return;
                        }
                    } catch (e) {
                        console.warn('Auto-login after biometric failed', e);
                    }
                }

                // fallback
                navigation.navigate('AuthOptions');
            } else {
                navigation.navigate('AuthOptions');
            }
        } catch (error) {
            console.error('Biometric auth error from InviteScreen:', error);
            navigation.navigate('AuthOptions');
        }
    };

    // This effect cycles through the images for the background every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBgIndex(prevIndex => (prevIndex + 1) % imageUrls.length);
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <View style={styles.container}>
            {/* --- Background Section --- */}
            {/* Animated wrapper — apply entering/exiting to the wrapper, not the Image */}
            <Animated.View
                key={currentBgIndex}
                style={styles.backgroundWrapper}
                entering={FadeIn.duration(1000)}
                exiting={FadeOut.duration(1000)}
            >
                <Image
                    source={normalizedImages[currentBgIndex] as any}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                />
            </Animated.View>
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />

            {/* --- Marquee Section --- */}
            <View style={styles.marqueeContainer}>
                {/* Left Column - scrolls up */}
                <Marquee spacing={20} speed={0.3} direction="vertical">
                    {leftColumnImages.map((item, index) => (
                        <Image key={`left-${index}`} source={item as any} style={styles.image} />
                    ))}
                </Marquee>

                {/* Right Column - scrolls down */}
                <Marquee spacing={20} speed={0.4} direction="vertical">
                    {rightColumnImages.map((item, index) => (
                        <Image key={`right-${index}`} source={item as any} style={styles.image} />
                    ))}
                </Marquee>
            </View>

            {/* --- Text Overlay Section --- */}
            <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.8)", "rgba(0,0,0,1)"]}
                style={styles.overlay}>
                <Text style={styles.welcomeText}>Welcome to</Text>
                <Text style={styles.titleText}>Healthy Smiles</Text>
                <Text style={styles.descriptionText}>
                    Where All your Medicinal Files and Records are Safe and Secure.
                </Text>

                {/* Get Started button */}
                <RNAnimated.View style={[styles.buttonWrapper, { transform: [{ scale }] }]}> 
                    <Pressable
                        accessibilityLabel="Get Started"
                        onPress={handleGetStarted}
                        onPressIn={onPressIn}
                        onPressOut={onPressOut}
                        android_ripple={{ color: 'rgba(255,255,255,0.12)' }}
                        style={({ pressed }) => [
                            styles.getStartedButton,
                            pressed && Platform.OS === 'ios' ? styles.buttonPressedIOS : null,
                        ]}
                    >
                        <Text style={styles.getStartedText}>Get Started</Text>
                    </Pressable>
                </RNAnimated.View>
            </LinearGradient>
        </View>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
    },
    // wrapper for the animated layout — full-screen
    backgroundWrapper: {
        ...StyleSheet.absoluteFillObject,
        width,
        height,
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        width,
        height,
        opacity: 0.4, // static opacity on Image (not animated by Reanimated layout)
    },
    marqueeContainer: {
        flexDirection: 'row',
        height: '100%',
        width: '100%',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
    },
    image: {
        width: width * 0.45, // Each image takes up 45% of the screen width
        height: height * 0.3, // Each image is 30% of the screen height
        borderRadius: 20,
        marginVertical: 10,
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 30,
        paddingBottom: 60, // Extra padding at the bottom for safe area
    },
    buttonWrapper: {
        marginTop: 24,
        alignItems: 'center',
    },
    getStartedButton: {
        width: 220,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 999,
        backgroundColor: '#06b6d4',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
            },
            android: {
                elevation: 6,
            },
        }),
    },
    buttonPressedIOS: {
        opacity: 0.95,
    },
    getStartedText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    welcomeText: {
        fontSize: 18,
        color: '#f9f5f5ff', // Light gray color
        textAlign: 'center',
    },
    titleText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 10,
    },
    descriptionText: {
        fontSize: 16,
        color: '#D3D3D3', // Lighter gray
        textAlign: 'center',
        lineHeight: 24,
    },
});

export default InvitesScreen;