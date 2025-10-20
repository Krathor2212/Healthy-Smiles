import { Ionicons } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from '@react-navigation/native';
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
import { homeStyles } from "./styles/homeStyles";

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [showArticleContent, setShowArticleContent] = useState(false);

  const doctors = [
    {
      id: 1,
      name: "Dr. Marcus Horizon",
      specialty: "Cardiologist",
      rating: 4.7,
      distance: "800m away",
      image: "https://cdn-icons-png.flaticon.com/512/3774/3774299.png",
    },
    {
      id: 2,
      name: "Dr. Maria Elena",
      specialty: "Psychologist",
      rating: 4.7,
      distance: "1.5km away",
      image: "https://cdn-icons-png.flaticon.com/512/3774/3774299.png",
    },
    {
      id: 3,
      name: "Dr. Stefi Jessi",
      specialty: "Orthopedist",
      rating: 4.7,
      distance: "2km away",
      image: "https://cdn-icons-png.flaticon.com/512/3774/3774299.png",
    },
  ];

  const heartArticleContent = [
    {
      type: 'subtitle',
      content: '1. Eat a Heart-Healthy Diet'
    },
    {
      type: 'bullet',
      content: 'Focus on fruits, vegetables, and whole grains'
    },
    {
      type: 'bullet',
      content: 'Limit saturated fats and avoid trans fats'
    },
    {
      type: 'subtitle',
      content: '2. Stay Physically Active'
    },
    {
      type: 'bullet',
      content: 'Aim for 150 minutes of exercise weekly'
    },
    {
      type: 'bullet',
      content: 'Include both cardio and strength training'
    },
    {
      type: 'subtitle',
      content: '3. Maintain a Healthy Weight'
    },
    {
      type: 'bullet',
      content: 'Monitor your BMI regularly'
    },
    {
      type: 'bullet',
      content: 'Combine diet and exercise for best results'
    },
    {
      type: 'subtitle',
      content: '4. Manage Stress Effectively'
    },
    {
      type: 'bullet',
      content: 'Practice relaxation techniques'
    },
    {
      type: 'bullet',
      content: 'Get 7-9 hours of sleep per night'
    },
    {
      type: 'subtitle',
      content: '5. Regular Health Check-ups'
    },
    {
      type: 'bullet',
      content: 'Monitor blood pressure regularly'
    },
    {
      type: 'bullet',
      content: 'Check cholesterol levels annually'
    },
    {
      type: 'text',
      content: 'Small consistent changes lead to significant heart health improvements.'
    }
  ];

  const toggleArticleContent = () => {
    setShowArticleContent(!showArticleContent);
  };

  const renderArticleContent = () => {
    return heartArticleContent.map((item, index) => {
      if (item.type === 'subtitle') {
        return (
          <Text key={index} style={homeStyles.articleSubtitle}>
            {item.content}
          </Text>
        );
      } else if (item.type === 'bullet') {
        return (
          <Text key={index} style={homeStyles.articleBulletPoint}>
            • {item.content}
          </Text>
        );
      } else {
        return (
          <Text key={index} style={homeStyles.articleText}>
            {item.content}
          </Text>
        );
      }
    });
  };

  // Handle category navigation
  const handleCategoryPress = (category: string) => {
    switch (category) {
      case 'Pharmacy':
        navigation.navigate('PharmacyScreen');
        break;
      case 'Doctor':
        navigation.navigate('FindDoctorsScreen');
        break;
      case 'Hospital':
        // Add hospital navigation if needed
        break;
      case 'Ambulance':
        // Add ambulance navigation if needed
        break;
      default:
        break;
    }
  };

  return (
    <ScrollView style={homeStyles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={homeStyles.header}>
        <Text style={homeStyles.title}>Find your desire{"\n"}health solution</Text>
        <Ionicons name="notifications-outline" size={24} color="black" />
      </View>

      {/* Search bar */}
      <View style={homeStyles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#9CA3AF" />
        <TextInput
          placeholder="Search doctor, drugs, articles..."
          style={homeStyles.searchInput}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Categories */}
      <View style={homeStyles.categoryRow}>
        {[
          { icon: "medkit-outline", label: "Doctor" },
          { icon: "bag-handle-outline", label: "Pharmacy" },
          { icon: "business-outline", label: "Hospital" },
          { icon: "car-outline", label: "Ambulance" },
        ].map((item, index) => (
          <Pressable
            key={index}
            style={homeStyles.categoryCard}
            onPress={() => handleCategoryPress(item.label)}
            android_ripple={{ color: '#e6f3ee' }}
            hitSlop={6}
          >
            <Ionicons name={item.icon as any} size={24} color="#3CB179" />
            <Text style={homeStyles.categoryText}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Family health banner */}
      <View style={homeStyles.banner}>
        <View style={{ flex: 1 }}>
          <Text style={homeStyles.bannerTitle}>
            Early protection for your family health
          </Text>
          <TouchableOpacity style={homeStyles.learnMoreButton}>
            <Text style={homeStyles.learnMoreText}>Learn more</Text>
          </TouchableOpacity>
        </View>
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
          }}
          style={homeStyles.bannerImage}
        />
      </View>

      {/* Top Doctors */}
      <View style={homeStyles.sectionHeader}>
        <Text style={homeStyles.sectionTitle}>Top Doctor</Text>
        <TouchableOpacity onPress={() => navigation.navigate('topdoctor')}>
          <Text style={homeStyles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={homeStyles.horizontalScroll}
      >
        {doctors.map((doc) => (
          <TouchableOpacity
            key={doc.id}
            style={homeStyles.doctorCard}
            onPress={() => navigation.navigate('topdoctor')}
          >
            <Image source={{ uri: doc.image }} style={homeStyles.doctorImage} />
            <Text style={homeStyles.doctorName}>{doc.name}</Text>
            <Text style={homeStyles.doctorSpecialty}>{doc.specialty}</Text>
            <View style={homeStyles.doctorInfoRow}>
              <Ionicons name="star" size={14} color="#3CB179" />
              <Text style={homeStyles.doctorRating}>{doc.rating}</Text>
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text style={homeStyles.doctorDistance}>{doc.distance}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Health Articles Section */}
      <View style={homeStyles.sectionHeader}>
        <Text style={homeStyles.sectionTitle}>Health article</Text>
        <TouchableOpacity onPress={() => navigation.navigate('articles')}>
          <Text style={homeStyles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      {/* Article Box - Click to expand */}
      <TouchableOpacity 
        style={[
          homeStyles.articleBox,
          showArticleContent && homeStyles.expandedArticleBox
        ]} 
        onPress={toggleArticleContent}
      >
        <View style={homeStyles.articleHeader}>
          <Text style={homeStyles.articleTitle}>
            <Ionicons name="newspaper-outline" size={16} color="#111827" /> 5 Tips for a Healthy Heart
          </Text>
          <Ionicons 
            name={showArticleContent ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#6B7280" 
          />
        </View>
        <Text style={homeStyles.articleSummary}>
          Learn simple steps to protect your heart every day.
        </Text>

        {/* Expanded Content */}
        {showArticleContent && (
          <View style={homeStyles.articleContent}>
            {renderArticleContent()}
          </View>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}