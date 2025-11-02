import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Dimensions,
  Image,
  Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import AppHeader from '../components/AppHeader';
import type { RootStackParamList } from '../Navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

// --- Types ---

type Benefit = {
  id: string;
  text: string;
};

type Provider = {
  id: string;
  name: string;
  logoUrl: string;
};

// --- Mock Data ---
// Replace this with your API data

// !!! IMPORTANT: Replace this with your actual YouTube video ID
const YOUTUBE_VIDEO_ID = 'dWBlxYVGps0'; // Health Insurance Explained

const KEY_BENEFITS: Benefit[] = [
  { id: '1', text: 'Covers pre & post hospitalization' },
  { id: '2', text: 'Cashless claims at network hospitals' },
  { id: '3', text: 'Get tax benefits under Section 80D' },
  { id: '4', text: 'No-claim bonus and restore benefits' },
];

// Replace these with your actual provider logos
const SUPPORTED_PROVIDERS: Provider[] = [
  {
    id: '1',
    name: 'Max Bupa',
    logoUrl: 'https://www.maxbupa.com/content/dam/newsite/images/logo.png',
  },
  {
    id: '2',
    name: 'Star Health',
    logoUrl: 'https://www.starhealth.in/sites/all/themes/starhealth/images/star-logo.png',
  },
  {
    id: '3',
    name: 'HDFC ERGO',
    logoUrl: 'https://www.hdfcergo.com/images/default-source/health-insurance/logo_ergo.png',
  },
  {
    id: '4',
    name: 'Care Health',
    logoUrl: 'https://www.careinsurance.com/images/logo.png',
  },
];

// --- Constants ---
const { width } = Dimensions.get('window');
const MAIN_GREEN = '#34D399';
const TEXT_PRIMARY = '#1F2937';
const TEXT_SECONDARY = '#6B7280';
const BG_LIGHT_GRAY = '#F3F4F6';
const BORDER_COLOR = '#E5E7EB';

// Calculate video dimensions (16:9 aspect ratio)
const VIDEO_PADDING = 20 * 2; // Horizontal padding
const VIDEO_WIDTH = width - VIDEO_PADDING;
const VIDEO_HEIGHT = VIDEO_WIDTH * (9 / 16);

// --- Reusable Components ---

/**
 * Renders a single "Key Benefit" item
 */
const BenefitItem: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.benefitItem}>
    <Feather name="check-circle" size={20} color={MAIN_GREEN} />
    <Text style={styles.benefitText}>{text}</Text>
  </View>
);

/**
 * Renders a single "Provider Logo" card
 */
const ProviderLogoCard: React.FC<{ item: Provider }> = ({ item }) => (
  <View style={styles.providerCard}>
    <Image 
      source={{ uri: item.logoUrl || 'https://via.placeholder.com/150' }} 
      style={styles.providerLogo} 
    />
  </View>
);

// --- Main Medical Insurance Screen Component ---

const MedicalInsuranceScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleVideoPress = () => {
    Linking.openURL(`https://www.youtube.com/watch?v=${YOUTUBE_VIDEO_ID}`);
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={BG_LIGHT_GRAY} />
      <AppHeader title="Medical Insurance" onBack={() => navigation.goBack()} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* YouTube Video Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>How it Works</Text>
          <TouchableOpacity 
            style={styles.videoContainer}
            onPress={handleVideoPress}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: `https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/maxresdefault.jpg` }}
              style={styles.videoThumbnail}
              resizeMode="cover"
            />
            <View style={styles.playButtonOverlay}>
              <View style={styles.playButton}>
                <Feather name="play" size={32} color="#FFFFFF" style={{ marginLeft: 4 }} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Key Benefits Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Key Benefits</Text>
          {KEY_BENEFITS.map(benefit => (
            <BenefitItem key={benefit.id} text={benefit.text} />
          ))}
        </View>

      </ScrollView>
    </View>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_LIGHT_GRAY,
  },
  container: {
    flex: 1,
    backgroundColor: BG_LIGHT_GRAY,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  // Section
  sectionContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 16,
  },
  // Video
  videoContainer: {
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(10px)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  // Key Benefits
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  benefitText: {
    flex: 1, // Allow text to wrap
    fontSize: 15,
    color: TEXT_SECONDARY,
    marginLeft: 12,
    lineHeight: 22,
  },
  // Supported Providers
  providerList: {
    paddingRight: 20, // Ensure last item has space
  },
  providerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    marginRight: 12,
    height: 80,
    width: 160,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  providerLogo: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },
});

export default MedicalInsuranceScreen;


