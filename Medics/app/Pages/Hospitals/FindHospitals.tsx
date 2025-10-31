import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import AppHeader from '../../components/AppHeader';
import type { RootStackParamList } from '../../Navigation/types';

const { width } = Dimensions.get('window');

// --- Types ---

type Hospital = {
  id: string;
  name: string;
  speciality: string;
  rating: number;
  distance: string;
  latitude: number;
  longitude: number;
};

const TOP_RATED_HOSPITALS: Hospital[] = [
  {
    id: '1',
    name: 'Apollo Hospitals',
    speciality: 'Multi-Speciality',
    rating: 4.7,
    distance: '2.5km away',
    latitude: 13.0067,
    longitude: 80.2206,
  },
  {
    id: '2',
    name: 'MIOT International Hospital',
    speciality: 'Multi-Speciality',
    rating: 4.6,
    distance: '3.2km away',
    latitude: 13.0186,
    longitude: 80.2309,
  },
  {
    id: '3',
    name: 'Prashanth Hospital',
    speciality: 'Multi-Speciality',
    rating: 4.5,
    distance: '1.8km away',
    latitude: 12.9982,
    longitude: 80.2172,
  },
];

// --- Reusable Components ---

/**
 * Renders a single hospital card in the list
 */
const HospitalCard: React.FC<{ item: Hospital; onPress: () => void }> = ({ item, onPress }) => (
  <TouchableOpacity style={styles.hospitalCard} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.hospitalIconContainer}>
      <Ionicons name="business" size={32} color="#6B7280" />
    </View>
    <View style={styles.hospitalInfo}>
      <Text style={styles.hospitalName}>{item.name}</Text>
      <Text style={styles.hospitalSpeciality}>{item.speciality}</Text>
      <View style={styles.hospitalMeta}>
        <Ionicons name="star" size={16} color="#F59E0B" />
        <Text style={styles.hospitalRating}>{item.rating}</Text>
        <Ionicons name="location" size={16} color="#6B7280" style={{ marginLeft: 12 }} />
        <Text style={styles.hospitalDistance}>{item.distance}</Text>
      </View>
    </View>
    <TouchableOpacity style={styles.detailButton} onPress={onPress}>
      <Text style={styles.detailButtonText}>Detail</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

// --- Main Hospital Screen Component ---

export default function FindHospitals() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  const handleBackPress = () => navigation.goBack();

  const handleHospitalPress = (hospital: Hospital) => {
    navigation.navigate('HospitalDetails', {
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      speciality: hospital.speciality,
      rating: hospital.rating.toString(),
      distance: hospital.distance,
      latitude: hospital.latitude,
      longitude: hospital.longitude,
    });
  };

  // Default region - Guindy, Chennai, Tamil Nadu, India
  const initialRegion = {
    latitude: 13.0067,    // Guindy, Chennai latitude
    longitude: 80.2206,   // Guindy, Chennai longitude
    latitudeDelta: 0.0001,  // Zoom level (smaller = more zoomed in)
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent={false} backgroundColor="#fff" barStyle="dark-content" />
      
      <AppHeader
        title="Find Hospitals"
        onBack={handleBackPress}
        right={<Ionicons name="notifications-outline" size={24} color="black" />}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search hospitals or clinics"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Google Maps View */}
        <View style={styles.mapContainer}>
          <MapView
            // Remove PROVIDER_GOOGLE to use default (OpenStreetMap) - No API key needed!
            // provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={initialRegion}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsCompass={true}
          >
            {/* Add markers for each hospital */}
            {TOP_RATED_HOSPITALS.map((hospital) => (
              <Marker
                key={hospital.id}
                coordinate={{
                  latitude: hospital.latitude,
                  longitude: hospital.longitude,
                }}
                title={hospital.name}
                description={hospital.speciality}
                onPress={() => setSelectedHospital(hospital)}
              >
                <View style={styles.markerContainer}>
                  <Ionicons name="medical" size={24} color="#FFFFFF" />
                </View>
              </Marker>
            ))}
          </MapView>
        </View>

        {/* Hospital List */}
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Top-Rated Hospitals</Text>
          <View style={styles.hospitalList}>
            {TOP_RATED_HOSPITALS.map(hospital => (
              <HospitalCard 
                key={hospital.id} 
                item={hospital} 
                onPress={() => handleHospitalPress(hospital)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  mapContainer: {
    marginHorizontal: 20,
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    backgroundColor: '#3CB179',
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  listContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  hospitalList: {
    gap: 12,
  },
  hospitalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  hospitalIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  hospitalSpeciality: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  hospitalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hospitalRating: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  hospitalDistance: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  detailButton: {
    backgroundColor: '#3CB179',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 16,
  },
  detailButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

