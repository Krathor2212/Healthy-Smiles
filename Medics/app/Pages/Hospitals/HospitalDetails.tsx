import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import AppHeader from '../../components/AppHeader';
import JuicyTransitionWrapper from '../../components/JuicyTransitionWrapper';
import type { RootStackParamList } from '../../Navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: string;
  image: string;
  availability: string;
  phone?: string;
  bio?: string;
}

interface RouteParams {
  hospitalId: string;
  hospitalName: string;
  speciality: string;
  rating: string;
  distance: string;
  latitude: number;
  longitude: number;
}

const API_URL = Constants.expoConfig?.extra?.BACKEND_URL || 'http://10.10.112.140:4000';

export default function HospitalDetails() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const params = route.params as RouteParams;

  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("All");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  const handleBackPress = () => navigation.goBack();

  // Fetch doctors assigned to this hospital
  useEffect(() => {
    fetchHospitalDoctors();
  }, [params.hospitalId]);

  const fetchHospitalDoctors = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(
        `${API_URL}/api/hospitals/${params.hospitalId}/doctors`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDoctors(data.doctors || []);
      } else {
        console.error('Failed to fetch hospital doctors');
        setDoctors([]);
      }
    } catch (error) {
      console.error('Error fetching hospital doctors:', error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  // Get unique specialties from fetched doctors
  const specialties = [
    "All",
    ...Array.from(new Set(doctors.map(d => d.specialty))).filter(Boolean)
  ];

  // Filter doctors based on selected specialty
  const filteredDoctors = selectedSpecialty === "All" 
    ? doctors 
    : doctors.filter(doctor => doctor.specialty === selectedSpecialty);

  const handleBookAppointment = (doctor: Doctor) => {
    navigation.navigate('DoctorDetails', {
      doctorId: doctor.id.toString(),
      doctorName: doctor.name,
      specialty: doctor.specialty,
      rating: doctor.rating.toString(),
      distance: params.distance,
      image: doctor.image,
      experience: doctor.experience,
    });
  };

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${params.latitude},${params.longitude}&destination_place_id=${params.hospitalName}`;
    Linking.openURL(url).catch(err => console.error('Error opening maps:', err));
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent={false} backgroundColor="#fff" barStyle="dark-content" />

      <AppHeader
        title={params.hospitalName}
        onBack={handleBackPress}
        right={<Ionicons name="heart-outline" size={24} color="black" />}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hospital Info Card */}
        <View style={styles.hospitalInfoCard}>
          <View style={styles.hospitalIconLarge}>
            <Ionicons name="business" size={48} color="#3CB179" />
          </View>
          <View style={styles.hospitalDetails}>
            <Text style={styles.hospitalName}>{params.hospitalName}</Text>
            <Text style={styles.speciality}>{params.speciality}</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="star" size={18} color="#F59E0B" />
                <Text style={styles.metaText}>{params.rating} Rating</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="location" size={18} color="#3CB179" />
                <Text style={styles.metaText}>{params.distance}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Specialty Filter */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Filter by Specialty</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.specialtyScroll}
          contentContainerStyle={styles.specialtyScrollContent}
        >
          {specialties.map((specialty, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.specialtyButton,
                selectedSpecialty === specialty && styles.selectedSpecialtyButton
              ]}
              onPress={() => setSelectedSpecialty(specialty)}
            >
              <Text
                style={[
                  styles.specialtyButtonText,
                  selectedSpecialty === specialty && styles.selectedSpecialtyText
                ]}
              >
                {specialty}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Doctors List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedSpecialty === "All" ? "All Doctors" : selectedSpecialty + "s"}
          </Text>
          <Text style={styles.doctorCount}>({filteredDoctors.length})</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0091F5" />
            <Text style={styles.loadingText}>Loading doctors...</Text>
          </View>
        ) : filteredDoctors.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No doctors assigned to this hospital yet</Text>
            <Text style={styles.emptySubtext}>
              Doctors will be assigned by the admin
            </Text>
          </View>
        ) : (
          <View style={styles.doctorsList}>
            {filteredDoctors.map((doctor, index) => (
              <JuicyTransitionWrapper
                key={doctor.id}
                id={index}
                cardless
                delayMultiplier={150}
              >
                <TouchableOpacity
                  style={styles.doctorCard}
                  onPress={() => handleBookAppointment(doctor)}
                >
                  <Image source={{ uri: doctor.image }} style={styles.doctorImage} />
                  <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName}>{doctor.name}</Text>
                    <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                    <Text style={styles.doctorExperience}>
                      {doctor.experience || 'N/A'} experience
                    </Text>
                    <View style={styles.doctorMeta}>
                      <Ionicons name="star" size={14} color="#3CB179" />
                      <Text style={styles.doctorRating}>{doctor.rating}</Text>
                      <View style={styles.availabilityBadge}>
                        <Text style={styles.availabilityText}>{doctor.availability}</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => handleBookAppointment(doctor)}
                  >
                    <Text style={styles.bookButtonText}>Book</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </JuicyTransitionWrapper>
            ))}
          </View>
        )}

        {filteredDoctors.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="medical-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No doctors found</Text>
            <Text style={styles.emptyStateSubtext}>Try selecting a different specialty</Text>
          </View>
        )}

        {/* Bottom spacing for navigate button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Navigate Button */}
      <View style={styles.navigateButtonContainer}>
        <TouchableOpacity
          style={styles.navigateButton}
          onPress={handleNavigate}
          activeOpacity={0.8}
        >
          <Ionicons name="navigate" size={24} color="#FFFFFF" />
          <Text style={styles.navigateButtonText}>Get Directions to Hospital</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  hospitalInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  hospitalIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#E6F3EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  hospitalDetails: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  speciality: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  doctorCount: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
  },
  specialtyScroll: {
    marginBottom: 8,
  },
  specialtyScrollContent: {
    paddingRight: 16,
  },
  specialtyButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedSpecialtyButton: {
    backgroundColor: '#3CB179',
    borderColor: '#3CB179',
  },
  specialtyButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedSpecialtyText: {
    color: '#FFFFFF',
  },
  doctorsList: {
    gap: 12,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  doctorImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  doctorExperience: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  doctorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  doctorRating: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  availabilityBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  availabilityText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  bookButton: {
    backgroundColor: '#3CB179',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 12,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  navigateButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  navigateButton: {
    backgroundColor: '#3CB179',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#3CB179',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  navigateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
