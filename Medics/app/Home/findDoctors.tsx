import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation/types';
import { findDoctorsStyles } from "./styles/findDoctorsStyles";


interface Doctor {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  distance: string;
  experience: string;
  image: string;
}

interface DoctorsByCategory {
  [key: string]: Doctor[];
}

export default function FindDoctorsScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>("General");

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const handleBackPress = () => navigation.goBack();

  const categories = [
    { name: "General", icon: "medical-outline" },
    { name: "Lungs Specialist", icon: "medkit-outline" },
    { name: "Dentist", icon: "person-circle-outline" },
    { name: "Psychiatrist", icon: "person-outline" },
    { name: "Covid-19", icon: "pulse-outline" },
    { name: "Surgeon", icon: "cut-outline" },
    { name: "Cardiologist", icon: "heart-outline" },
  ];

  // Doctors data for each category with proper typing
  const doctorsByCategory: DoctorsByCategory = {
    "General": [
      {
        id: 1,
        name: "Dr. Sarah Johnson",
        specialty: "General Physician",
        rating: 4.8,
        distance: "500m away",
        experience: "10 years",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
      },
      {
        id: 2,
        name: "Dr. Michael Chen",
        specialty: "Family Medicine",
        rating: 4.6,
        distance: "1.2km away",
        experience: "8 years",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
      }
    ],
    "Lungs Specialist": [
      {
        id: 3,
        name: "Dr. Robert Kim",
        specialty: "Pulmonologist",
        rating: 4.9,
        distance: "800m away",
        experience: "15 years",
        image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face",
      },
      {
        id: 4,
        name: "Dr. Lisa Wang",
        specialty: "Respiratory Specialist",
        rating: 4.7,
        distance: "1.5km away",
        experience: "12 years",
        image: "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=150&h=150&fit=crop&crop=face",
      }
    ],
    "Dentist": [
      {
        id: 5,
        name: "Dr. James Wilson",
        specialty: "Dental Surgeon",
        rating: 4.8,
        distance: "600m away",
        experience: "9 years",
        image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face",
      },
      {
        id: 6,
        name: "Dr. Emily Davis",
        specialty: "Orthodontist",
        rating: 4.9,
        distance: "900m away",
        experience: "11 years",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
      }
    ],
    "Psychiatrist": [
      {
        id: 7,
        name: "Dr. Amanda Green",
        specialty: "Clinical Psychiatrist",
        rating: 4.7,
        distance: "1.1km away",
        experience: "13 years",
        image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=150&h=150&fit=crop&crop=face",
      },
      {
        id: 8,
        name: "Dr. David Park",
        specialty: "Mental Health Specialist",
        rating: 4.8,
        distance: "700m away",
        experience: "10 years",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
      }
    ],
    "Covid-19": [
      {
        id: 9,
        name: "Dr. Maria Rodriguez",
        specialty: "Infectious Disease",
        rating: 4.9,
        distance: "1.3km away",
        experience: "7 years",
        image: "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=150&h=150&fit=crop&crop=face",
      },
      {
        id: 10,
        name: "Dr. Kevin Patel",
        specialty: "Virology Specialist",
        rating: 4.6,
        distance: "800m away",
        experience: "6 years",
        image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face",
      }
    ],
    "Surgeon": [
      {
        id: 11,
        name: "Dr. Christopher Lee",
        specialty: "General Surgeon",
        rating: 4.9,
        distance: "1km away",
        experience: "14 years",
        image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face",
      },
      {
        id: 12,
        name: "Dr. Jennifer Brown",
        specialty: "Cardiac Surgeon",
        rating: 4.8,
        distance: "1.4km away",
        experience: "16 years",
        image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=150&h=150&fit=crop&crop=face",
      }
    ],
    "Cardiologist": [
      {
        id: 13,
        name: "Dr. Marcus Horizon",
        specialty: "Cardiologist",
        rating: 4.7,
        distance: "800m away",
        experience: "12 years",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
      },
      {
        id: 14,
        name: "Dr. Sophia Martinez",
        specialty: "Heart Specialist",
        rating: 4.9,
        distance: "1.2km away",
        experience: "15 years",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
      }
    ]
  };

  const recentDoctors = [
    { 
      id: 1, 
      name: "Dr. Marcus", 
      specialty: "Cardiologist",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face" 
    },
    { 
      id: 2, 
      name: "Dr. Maria", 
      specialty: "Psychiatrist",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face" 
    },
    { 
      id: 3, 
      name: "Dr. Stevi", 
      specialty: "Dentist",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face" 
    },
    { 
      id: 4, 
      name: "Dr. Luke", 
      specialty: "Surgeon",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face" 
    },
  ];

  // Safe access to doctors data
  const currentDoctors = doctorsByCategory[selectedCategory] || [];

  const handleBookAppointment = (doctor: Doctor) => {
    navigation.navigate('DoctorDetails', {
      doctorId: doctor.id.toString(),
      doctorName: doctor.name,
      specialty: doctor.specialty,
      rating: doctor.rating.toString(),
      distance: doctor.distance,
      image: doctor.image,
      experience: doctor.experience,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <ScrollView style={findDoctorsStyles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Back Button */}
      <View style={findDoctorsStyles.header}>
        <Pressable
          onPress={handleBackPress}
          android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
          style={findDoctorsStyles.backButton}
          accessibilityLabel="Go back"
        >
          <Feather name="chevron-left" size={18} color="#1A202C" />
        </Pressable>
        <Text style={findDoctorsStyles.title}>Find Doctors</Text>
        <Ionicons name="notifications-outline" size={24} color="black" />
      </View>

      {/* Search bar */}
      <View style={findDoctorsStyles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#9CA3AF" />
        <TextInput
          placeholder="Find a doctor"
          style={findDoctorsStyles.searchInput}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Categories */}
      <View style={findDoctorsStyles.sectionHeader}>
        <Text style={findDoctorsStyles.sectionTitle}>Category</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={findDoctorsStyles.categoriesScroll}
      >
        <View style={findDoctorsStyles.categoriesRow}>
          {categories.map((category, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                findDoctorsStyles.categoryButton,
                selectedCategory === category.name && findDoctorsStyles.selectedCategoryButton
              ]}
              onPress={() => setSelectedCategory(category.name)}
            >
              <Ionicons 
                name={category.icon as any} 
                size={24} 
                color={selectedCategory === category.name ? "#fff" : "#3CB179"} 
              />
              <Text style={[
                findDoctorsStyles.categoryButtonText,
                selectedCategory === category.name && findDoctorsStyles.selectedCategoryText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Recommended Doctors for Selected Category */}
      <View style={findDoctorsStyles.sectionHeader}>
        <Text style={findDoctorsStyles.sectionTitle}>{selectedCategory} Doctors</Text>
        <TouchableOpacity>
          <Text style={findDoctorsStyles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      <View style={findDoctorsStyles.doctorsList}>
        {currentDoctors.map((doctor) => (
          <TouchableOpacity key={doctor.id} style={findDoctorsStyles.doctorListItem}>
            <Image source={{ uri: doctor.image }} style={findDoctorsStyles.doctorListImage} />
            <View style={findDoctorsStyles.doctorInfo}>
              <Text style={findDoctorsStyles.doctorName}>{doctor.name}</Text>
              <Text style={findDoctorsStyles.doctorSpecialty}>{doctor.specialty}</Text>
              <Text style={findDoctorsStyles.doctorExperience}>{doctor.experience} experience</Text>
              <View style={findDoctorsStyles.doctorInfoRow}>
                <Ionicons name="star" size={14} color="#3CB179" />
                <Text style={findDoctorsStyles.doctorRating}>{doctor.rating}</Text>
                <Ionicons name="location-outline" size={14} color="#6B7280" />
                <Text style={findDoctorsStyles.doctorDistance}>{doctor.distance}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={findDoctorsStyles.bookButton}
              onPress={() => handleBookAppointment(doctor)}
            >
              <Text style={findDoctorsStyles.bookButtonText}>Book</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Doctors */}
      <View style={findDoctorsStyles.sectionHeader}>
        <Text style={findDoctorsStyles.sectionTitle}>Your Recent Doctors</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={findDoctorsStyles.horizontalScroll}
      >
        {recentDoctors.map((doctor) => (
          <TouchableOpacity 
            key={doctor.id} 
            style={findDoctorsStyles.recentDoctorCard}
            onPress={() => navigation.navigate('DoctorDetails' as any, {
              doctorId: doctor.id.toString(),
              doctorName: doctor.name,
              specialty: doctor.specialty,
              rating: '4.7',
              distance: '800m away',
              image: doctor.image,
              experience: '10 years',
            })}
          >
            <Image source={{ uri: doctor.image }} style={findDoctorsStyles.recentDoctorImage} />
            <Text style={findDoctorsStyles.recentDoctorName}>{doctor.name}</Text>
            <Text style={findDoctorsStyles.recentDoctorSpecialty}>{doctor.specialty}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}
