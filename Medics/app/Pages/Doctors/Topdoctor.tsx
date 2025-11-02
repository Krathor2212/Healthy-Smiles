import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from "react";
import { FlatList, Image, Pressable, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import AppHeader from '../../components/AppHeader';
import type { RootStackParamList } from '../../Navigation/types';
import { topDoctorStyles } from "../styles/topDoctorStyles";
import { useAppData } from '../../contexts/AppDataContext';

export default function TopDoctorScreen() {
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { topDoctors, loading } = useAppData();

  const handleDoctorPress = (doctor: any) => {
    setSelectedDoctor(doctor.id);
    navigation.navigate('DoctorDetails', {
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty || 'General Physician',
      rating: String(doctor.rating || '4.5'),
      distance: doctor.distance || '1km away',
      image: doctor.image || 'https://i.pravatar.cc/150?img=12',
      experience: doctor.experience || '10 years',
    });
  };

  const handleBackPress = () => navigation.goBack();

  if (loading) {
    return (
      <View style={topDoctorStyles.container}>
        <AppHeader title="Top Doctor" onBack={handleBackPress} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3CB179" />
          <Text style={{ marginTop: 12, color: '#666' }}>Loading doctors...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={topDoctorStyles.container}>
      <AppHeader title="Top Doctor" onBack={handleBackPress} />

      {topDoctors.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="people-outline" size={80} color="#CCC" />
          <Text style={{ fontSize: 18, color: '#666', marginTop: 16, fontWeight: '600' }}>No Doctors Available</Text>
          <Text style={{ fontSize: 14, color: '#999', marginTop: 8, textAlign: 'center' }}>
            Top doctors will appear here once they are added to the system
          </Text>
        </View>
      ) : (
        <FlatList
          data={topDoctors}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 32, paddingTop: 6 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                topDoctorStyles.card,
                selectedDoctor === item.id && topDoctorStyles.selectedCard
              ]}
              onPress={() => handleDoctorPress(item)}
              activeOpacity={0.85}
            >
              <Image source={{ uri: item.image || 'https://i.pravatar.cc/150?img=12' }} style={topDoctorStyles.image} />
              <Pressable style={topDoctorStyles.infoContainer} onPress={() => handleDoctorPress(item)}>
                <Text style={topDoctorStyles.name}>{item.name}</Text>
                <Text style={topDoctorStyles.specialty}>{item.specialty || 'General Physician'}</Text>
                <Pressable style={topDoctorStyles.detailsContainer} onPress={() => {}}>
                  <Pressable style={topDoctorStyles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#0AB6AB" />
                    <Text style={topDoctorStyles.rating}>{item.rating || '4.5'}</Text>
                  </Pressable>
                  <Pressable style={topDoctorStyles.distanceContainer}>
                    <Ionicons name="location-outline" size={14} color="#0AB6AB" />
                    <Text style={topDoctorStyles.distance}>{item.distance || '1km away'}</Text>
                  </Pressable>
                </Pressable>
              </Pressable>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}