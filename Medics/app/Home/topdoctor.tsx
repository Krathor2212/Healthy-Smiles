import { useNavigation } from '@react-navigation/native';
import React, { useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { topDoctorStyles } from "./styles/topDoctorStyles";

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
  const navigation = useNavigation();

  const handleDoctorPress = (doctorId: string) => {
    setSelectedDoctor(doctorId);
    console.log(`Doctor ${doctorId} selected`);
  };

  const handleBackPress = () => {
    (navigation as any).goBack();
  };

  return (
    <View style={topDoctorStyles.container}>
      {/* Header with Back Button */}
      <View style={topDoctorStyles.header}>
        <TouchableOpacity onPress={handleBackPress} style={topDoctorStyles.backButton}>
          <Text style={topDoctorStyles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={topDoctorStyles.title}>Top Doctor</Text>
        <View style={topDoctorStyles.placeholder} />
      </View>

      <FlatList
        data={doctors}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[
              topDoctorStyles.card,
              selectedDoctor === item.id && topDoctorStyles.selectedCard
            ]}
            onPress={() => handleDoctorPress(item.id)}
            activeOpacity={0.7}
          >
            <Image source={{ uri: item.image }} style={topDoctorStyles.image} />
            <View style={topDoctorStyles.infoContainer}>
              <Text style={topDoctorStyles.name}>{item.name}</Text>
              <Text style={topDoctorStyles.specialty}>{item.specialty}</Text>
              <View style={topDoctorStyles.detailsContainer}>
                <View style={topDoctorStyles.ratingContainer}>
                  <Text style={topDoctorStyles.ratingIcon}>📌</Text>
                  <Text style={topDoctorStyles.rating}>{item.rating}</Text>
                </View>
                <View style={topDoctorStyles.distanceContainer}>
                  <Text style={topDoctorStyles.distanceIcon}>🗥</Text>
                  <Text style={topDoctorStyles.distance}>{item.distance}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}