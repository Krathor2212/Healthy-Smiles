import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import AppHeader from '../../components/AppHeader';
import type { RootStackParamList } from '../../Navigation/types';
import { doctorDetailStyles } from "../styles/doctorDetailStyles";

type DoctorDetailsRouteProp = RouteProp<RootStackParamList, 'DoctorDetails'>;
export default function DoctorDetailsScreen() {
  const route = useRoute<DoctorDetailsRouteProp>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const handleBackPress = () => navigation.goBack();

  const params = (route.params as RootStackParamList['DoctorDetails']) ?? {
    doctorId: '',
    doctorName: '',
    specialty: '',
    rating: '',
    distance: '',
    image: '',
    experience: '',
  };
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  // Helper function to ensure we get a string value
  const getStringParam = (param: string | string[] | undefined): string => {
    if (Array.isArray(param)) {
      return param[0] || "";
    }
    return param || "";
  };

  // Doctor descriptions based on specialty
  const getDoctorDescription = (specialty: string, name: string) => {
    const descriptions: { [key: string]: string } = {
      "Cardiologist": `${name} is a board-certified cardiologist with extensive experience in diagnosing and treating heart conditions. Specializing in cardiac care, ${name} provides comprehensive heart health assessments, preventive care, and advanced treatment options for various cardiovascular diseases.`,
      "General Physician": `${name} is a dedicated general physician providing comprehensive primary care services. With a patient-centered approach, ${name} focuses on preventive medicine, routine check-ups, and managing common health conditions for patients of all ages.`,
      "Family Medicine": `${name} specializes in family medicine, offering continuous and comprehensive healthcare for individuals and families. ${name} provides preventive care, chronic disease management, and treatment for acute illnesses across all age groups.`,
      "Pulmonologist": `${name} is an experienced pulmonologist specializing in respiratory system disorders. ${name} provides expert care for conditions like asthma, COPD, pneumonia, and other lung-related diseases using the latest diagnostic and treatment methods.`,
      "Respiratory Specialist": `${name} focuses on respiratory health, providing specialized care for breathing disorders and lung conditions. ${name} offers comprehensive pulmonary function testing and personalized treatment plans.`,
      "Dental Surgeon": `${name} is a skilled dental surgeon with expertise in oral surgery and complex dental procedures. ${name} provides comprehensive dental care including extractions, implants, and oral health maintenance.`,
      "Orthodontist": `${name} specializes in orthodontics, helping patients achieve perfect smiles through braces, aligners, and other corrective treatments. ${name} creates personalized treatment plans for optimal dental alignment.`,
      "Clinical Psychiatrist": `${name} is a compassionate clinical psychiatrist providing mental health care and psychiatric treatment. ${name} specializes in diagnosing and treating mental health disorders through therapy and medication management.`,
      "Mental Health Specialist": `${name} offers comprehensive mental health support and counseling services. ${name} helps patients navigate emotional challenges and develop coping strategies for better mental wellbeing.`,
      "Infectious Disease": `${name} specializes in infectious diseases, providing expert care for complex infections and immune system disorders. ${name} stays updated with the latest treatments and preventive measures.`,
      "Virology Specialist": `${name} is a virology expert focusing on viral infections and their treatment. ${name} provides specialized care for patients with complex viral conditions.`,
      "General Surgeon": `${name} is an experienced general surgeon performing a wide range of surgical procedures. ${name} ensures patient safety and optimal outcomes through meticulous surgical techniques.`,
      "Cardiac Surgeon": `${name} is a highly skilled cardiac surgeon specializing in heart surgeries and cardiovascular procedures. ${name} has extensive experience in complex cardiac operations with excellent success rates.`,
      "Psychologist": `${name} provides psychological counseling and therapy services. ${name} helps patients overcome mental health challenges and improve their quality of life through evidence-based therapeutic approaches.`,
      "Orthopedist": `${name} specializes in orthopedic care, treating musculoskeletal conditions and injuries. ${name} provides comprehensive bone and joint care with personalized treatment plans.`
    };

    return descriptions[specialty] || `${name} is a dedicated healthcare professional committed to providing excellent medical care and personalized treatment to all patients. With years of experience and ongoing medical education, ${name} ensures the highest standards of patient care and medical excellence.`;
  };

  // Get doctor data from navigation params with proper string conversion
  const doctorData = {
    id: getStringParam(params.doctorId),
    name: getStringParam(params.doctorName),
    specialty: getStringParam(params.specialty),
    rating: getStringParam(params.rating),
    distance: getStringParam(params.distance),
    experience: getStringParam(params.experience),
    image: getStringParam(params.image),
    about: getDoctorDescription(getStringParam(params.specialty), getStringParam(params.doctorName)),
  };

  // Generate current dates for the next 7 days
  const generateDates = () => {
    const dates = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      const dayName = days[date.getDay()];
      const dayNumber = date.getDate().toString();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      const fullDate = `${dayName}, ${month} ${dayNumber}, ${year}`;
      const isToday = i === 0;
      
      dates.push({
        day: isToday ? 'Today' : dayName,
        date: dayNumber,
        fullDate: fullDate,
        month: month,
        year: year.toString(),
        isToday: isToday,
        dateObj: date
      });
    }
    
    // Set today's date as selected by default
    if (!selectedDate && dates.length > 0) {
      setSelectedDate(dates[0].date);
    }
    
    return dates;
  };

  const dates = generateDates();
  
  // All possible time slots
  const allTimeSlots = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", 
    "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", 
    "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
  ];

  // Filter time slots based on current time for today
  const getAvailableTimeSlots = (selectedDateStr: string) => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    
    const selectedDateObj = dates.find(date => date.date === selectedDateStr);
    
    if (!selectedDateObj) return allTimeSlots;
    
    // If selected date is today, filter out past times
    if (selectedDateObj.isToday) {
      return allTimeSlots.filter(timeSlot => {
        const [time, period] = timeSlot.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        
        // Convert to 24-hour format for comparison
        let hour24 = hours;
        if (period === 'PM' && hours !== 12) hour24 += 12;
        if (period === 'AM' && hours === 12) hour24 = 0;
        
        // Check if this time slot is in the future
        if (hour24 > currentHours) return true;
        if (hour24 === currentHours && minutes > currentMinutes) return true;
        
        return false;
      });
    }
    
    // For future dates, all time slots are available
    return allTimeSlots;
  };

  // Update available time slots when selected date changes
  useEffect(() => {
    if (selectedDate) {
      const availableSlots = getAvailableTimeSlots(selectedDate);
      setAvailableTimeSlots(availableSlots);
      
      // Reset selected time if it's no longer available
      if (selectedTime && !availableSlots.includes(selectedTime)) {
        setSelectedTime("");
      }
    }
  }, [selectedDate]);

  // Initialize available time slots on component mount
  useEffect(() => {
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0].date);
    }
  }, [dates, selectedDate]);

  const handleBookAppointment = () => {
    if (!selectedTime) {
      Alert.alert("Select Time", "Please select a time slot for your appointment.");
      return;
    }

    // Find the selected date object to get full date information
    const selectedDateObj = dates.find(date => date.date === selectedDate);
    
    if (!selectedDateObj) {
      Alert.alert("Error", "Please select a valid date.");
      return;
    }

    // Navigate to appointment page with all necessary data
    navigation.navigate("Appointment" as any, {
      doctorId: doctorData.id,
      doctorName: doctorData.name,
      specialty: doctorData.specialty,
      rating: doctorData.rating,
      distance: doctorData.distance,
      image: doctorData.image,
      date: selectedDateObj.fullDate,
      dateISO: selectedDateObj.dateObj.toISOString().split('T')[0], // "YYYY-MM-DD"
      time: selectedTime,
      reason: "General Consultation",
    });
  };

  return (
    <View style={{ flex: 1 }}>
    <AppHeader 
      title="Doctor Details" 
      onBack={handleBackPress} 
      right={<Ionicons name="notifications-outline" size={24} color="black" />}
      onRightPress={() => navigation.navigate('Notifications')}
    />
      <ScrollView style={doctorDetailStyles.container} showsVerticalScrollIndicator={false}>
      {/* Doctor Profile */}
      <View style={doctorDetailStyles.doctorProfile}>
        <Image 
          source={{ uri: doctorData.image }} 
          style={doctorDetailStyles.doctorDetailImage} 
        />
        <View style={doctorDetailStyles.doctorProfileInfo}>
          <Text style={doctorDetailStyles.doctorDetailName}>{doctorData.name}</Text>
          <Text style={doctorDetailStyles.doctorDetailSpecialty}>{doctorData.specialty}</Text>
          <View style={doctorDetailStyles.doctorDetailStats}>
            <View style={doctorDetailStyles.doctorStat}>
              <Ionicons name="star" size={16} color="#3CB179" />
              <Text style={doctorDetailStyles.doctorStatText}>{doctorData.rating}</Text>
            </View>
            <View style={doctorDetailStyles.doctorStat}>
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Text style={doctorDetailStyles.doctorStatText}>{doctorData.distance}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* About Section */}
      <View style={doctorDetailStyles.section}>
        <Text style={doctorDetailStyles.sectionTitle}>About</Text>
        <Text style={doctorDetailStyles.aboutText}>
          {doctorData.about}
        </Text>
        <Text style={doctorDetailStyles.readMoreText}>Read more</Text>
      </View>

      {/* Date Selection */}
      <View style={doctorDetailStyles.section}>
        <Text style={doctorDetailStyles.sectionTitle}>Select Date</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={doctorDetailStyles.datesScroll}
        >
          <View style={doctorDetailStyles.datesContainer}>
            {dates.map((dateObj) => (
              <TouchableOpacity
                key={dateObj.date}
                style={[
                  doctorDetailStyles.dateButton,
                  selectedDate === dateObj.date && doctorDetailStyles.selectedDateButton
                ]}
                onPress={() => setSelectedDate(dateObj.date)}
              >
                <Text style={[
                  doctorDetailStyles.dateDayText,
                  selectedDate === dateObj.date && doctorDetailStyles.selectedDateText
                ]}>
                  {dateObj.day}
                </Text>
                <Text style={[
                  doctorDetailStyles.dateNumberText,
                  selectedDate === dateObj.date && doctorDetailStyles.selectedDateText
                ]}>
                  {dateObj.date}
                </Text>
                <Text style={[
                  doctorDetailStyles.dateMonthText,
                  selectedDate === dateObj.date && doctorDetailStyles.selectedDateText
                ]}>
                  {dateObj.month}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Time Slots */}
      <View style={doctorDetailStyles.section}>
        <View style={doctorDetailStyles.sectionHeaderRow}>
          <Text style={doctorDetailStyles.sectionTitle}>Available Time Slots</Text>
        </View>
        {selectedDate === dates[0]?.date && (
          <Text style={[doctorDetailStyles.timeNoteText, { alignSelf: 'flex-end', marginBottom: 8 }]}>* Past times hidden for today</Text>
        )}
        <View style={doctorDetailStyles.timeSlotsGrid}>
          {availableTimeSlots.length > 0 ? (
            availableTimeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  doctorDetailStyles.timeSlotButton,
                  selectedTime === time && doctorDetailStyles.selectedTimeSlotButton
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[
                  doctorDetailStyles.timeSlotText,
                  selectedTime === time && doctorDetailStyles.selectedTimeSlotText
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={doctorDetailStyles.noSlotsText}>
              No available time slots for selected date
            </Text>
          )}
        </View>
      </View>

      {/* Book Appointment Button */}
      <TouchableOpacity 
        style={[
          doctorDetailStyles.bookAppointmentButton,
          (!selectedTime || availableTimeSlots.length === 0) && doctorDetailStyles.disabledButton
        ]}
        onPress={handleBookAppointment}
        disabled={!selectedTime || availableTimeSlots.length === 0}
      >
        <Text style={doctorDetailStyles.bookAppointmentButtonText}>
          {availableTimeSlots.length === 0 ? 'No Available Slots' : 'Book Appointment'}
        </Text>
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
}