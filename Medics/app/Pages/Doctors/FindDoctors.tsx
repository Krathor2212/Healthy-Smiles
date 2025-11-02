import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import AppHeader from '../../components/AppHeader';
import JuicyTransitionWrapper from '../../components/JuicyTransitionWrapper';
import type { RootStackParamList } from '../../Navigation/types';
import findDoctorsStyles from "../styles/findDoctorsStyles";
import { useAppData } from '../../contexts/AppDataContext';


export default function FindDoctorsScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const handleBackPress = () => navigation.goBack();

  // Use AppDataContext instead of static data
  const {
    filteredDoctors,
    categories: appCategories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    loading
  } = useAppData();

  // Use doctor categories from context or fallback to default
  const categories = appCategories.doctors.length > 0 
    ? appCategories.doctors 
    : [
        { name: "General", icon: "medical-outline", count: 0 },
        { name: "Lungs Specialist", icon: "medkit-outline", count: 0 },
        { name: "Dentist", icon: "person-circle-outline", count: 0 },
        { name: "Psychiatrist", icon: "person-outline", count: 0 },
        { name: "Covid-19", icon: "pulse-outline", count: 0 },
        { name: "Surgeon", icon: "cut-outline", count: 0 },
        { name: "Cardiologist", icon: "heart-outline", count: 0 },
      ];

  // Get recent doctors (first 4 from filtered list)
  const recentDoctors = filteredDoctors.slice(0, 4);

  // Current doctors are the filtered doctors from context
  const currentDoctors = filteredDoctors;

  const handleBookAppointment = (doctor: any) => {
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
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar translucent={false} backgroundColor="#fff" barStyle="dark-content" />

      {/* AppHeader already wraps itself with SafeAreaView */}
      <AppHeader
        title="Find Doctors"
        onBack={handleBackPress}
        right={<Ionicons name="notifications-outline" size={24} color="black" />}
        onRightPress={() => navigation.navigate('Notifications')}
      />

      <ScrollView
        style={findDoctorsStyles.container}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Search bar */}
        <View style={[findDoctorsStyles.searchContainer, { paddingHorizontal: 0, marginTop: 8 }]}>
          <TextInput
            placeholder="Find a doctor"
            style={[findDoctorsStyles.searchInput, { height: 44, borderRadius: 12, paddingVertical: 8 }]}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
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

        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={{ marginTop: 12, color: '#666' }}>Loading doctors...</Text>
          </View>
        ) : currentDoctors.length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#999' }}>No doctors found in this category</Text>
          </View>
        ) : (
          <View style={findDoctorsStyles.doctorsList}>
            {currentDoctors.map((doctor, index) => (
              <JuicyTransitionWrapper
                key={doctor.id}
                id={index}
                cardless
                delayMultiplier={250} 
              >
                <TouchableOpacity
                  style={findDoctorsStyles.doctorListItem}
                  onPress={() => handleBookAppointment(doctor)}
                >
                  <Image 
                    source={{ uri: doctor.image || 'https://via.placeholder.com/150' }} 
                    style={findDoctorsStyles.doctorListImage} 
                  />
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
              </JuicyTransitionWrapper>
            ))}
          </View>
        )}

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
                image: doctor.image || 'https://via.placeholder.com/150',
                experience: '10 years',
              })}
            >
              <Image 
                source={{ uri: doctor.image || 'https://via.placeholder.com/150' }} 
                style={findDoctorsStyles.recentDoctorImage} 
              />
              <Text style={findDoctorsStyles.recentDoctorName}>{doctor.name}</Text>
              <Text style={findDoctorsStyles.recentDoctorSpecialty}>{doctor.specialty}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}
