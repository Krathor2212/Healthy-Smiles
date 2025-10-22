import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from "react";
import { FlatList, Image, Pressable, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import type { RootStackParamList } from '../../navigation/types';
import { topDoctorStyles } from "../styles/topDoctorStyles";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  distance: string;
  image: string;
};

const doctors: Doctor[] = [
  { 
    id: "1", 
    name: "Dr. Marcus Horizon", 
    specialty: "Cardiologist", 
    rating: 4.7, 
    distance: "800m away", 
    image: "https://i.pravatar.cc/150?img=12" 
  },
  { 
    id: "2", 
    name: "Dr. Maria Elena", 
    specialty: "Psychologist", 
    rating: 4.7, 
    distance: "800m away", 
    image: "https://i.pravatar.cc/150?img=30" 
  },
  { 
    id: "3", 
    name: "Dr. Stefi Jessi", 
    specialty: "Orthopedist", 
    rating: 4.7, 
    distance: "800m away", 
    image: "https://i.pravatar.cc/150?img=40" 
  },
  { 
    id: "4", 
    name: "Dr. Gerty Cori", 
    specialty: "Orthopedist", 
    rating: 4.7, 
    distance: "800m away", 
    image: "https://i.pravatar.cc/150?img=55" 
  },
  { 
    id: "5", 
    name: "Dr. Diandra", 
    specialty: "Orthopedist", 
    rating: 4.7, 
    distance: "800m away", 
    image: "https://i.pravatar.cc/150?img=10" 
  },
];

export default function TopDoctorScreen() {
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleDoctorPress = (doctor: Doctor) => {
    setSelectedDoctor(doctor.id);
    navigation.navigate('DoctorDetails', {
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      rating: String(doctor.rating),
      distance: doctor.distance,
      image: doctor.image,
      experience: '10 years',
    });
  };

  const handleBackPress = () => navigation.goBack();

  return (
    <SafeAreaView style={topDoctorStyles.container} edges={["top"]}>
      <AppHeader title="Top Doctor" onBack={handleBackPress} />

      <FlatList
        data={doctors}
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
            <Image source={{ uri: item.image }} style={topDoctorStyles.image} />
            <Pressable style={topDoctorStyles.infoContainer} onPress={() => handleDoctorPress(item)}>
              <Text style={topDoctorStyles.name}>{item.name}</Text>
              <Text style={topDoctorStyles.specialty}>{item.specialty}</Text>
              <Pressable style={topDoctorStyles.detailsContainer} onPress={() => {}}>
                <Pressable style={topDoctorStyles.ratingContainer}>
                  <Ionicons name="star" size={14} color="#0AB6AB" />
                  <Text style={topDoctorStyles.rating}>{item.rating}</Text>
                </Pressable>
                <Pressable style={topDoctorStyles.distanceContainer}>
                  <Ionicons name="location-outline" size={14} color="#0AB6AB" />
                  <Text style={topDoctorStyles.distance}>{item.distance}</Text>
                </Pressable>
              </Pressable>
            </Pressable>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}