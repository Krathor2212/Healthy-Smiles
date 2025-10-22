import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from "react";
import { Alert, Image, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import AppHeader from '../../components/AppHeader';
import type { RootStackParamList } from '../../Navigation/types';
import appointmentStyles from "../styles/appointmentStyles";

type AppointmentRouteProp = RouteProp<RootStackParamList, 'Appointment'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function AppointmentScreen() {
  const route = useRoute<AppointmentRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const params = route.params || {};
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState(params.reason as string || "General Consultation");

  // Get appointment data from navigation params
  const appointmentData = {
    doctorName: params.doctorName as string || "Dr. Marcus Horizon",
    specialty: params.specialty as string || "Cardiologist",
    rating: params.rating as string || "4.7",
    distance: params.distance as string || "800m away",
    image: params.image as string || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
    date: params.date as string || "Wednesday, Jun 23, 2021",
    time: params.time as string || "10:00 AM",
    reason: selectedReason,
  };

  // Common medical reasons for consultation
  const commonReasons = [
    "General Consultation",
    "Fever and Cold",
    "Chest Pain",
    "Headache",
    "Stomach Pain",
    "Body Ache",
    "Follow-up Visit",
    "Health Checkup",
    "Prescription Refill",
    "Allergy Symptoms",
    "Breathing Difficulty",
    "Skin Issues",
    "Joint Pain",
    "Eye Problem",
    "Dental Issue"
  ];

  const paymentDetails = [
    { item: "Consultation", amount: "₹500.00" },
    { item: "Admin Fee", amount: "₹50.00" },
    { item: "Additional Discount", amount: "-" },
  ];

  const totalAmount = "₹550.00";

  const handleBooking = () => {
    Alert.alert(
      "Confirm Booking",
      `Confirm appointment with ${appointmentData.doctorName} on ${appointmentData.date} at ${appointmentData.time} for ${appointmentData.reason}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm Booking", 
          onPress: () => {
                  Alert.alert("Success", "Appointment booked successfully!");
                  (navigation as any).navigate('Home');
                }
        },
      ]
    );
  };

  const handleDateChange = () => {
    // Navigate back to doctor details page to change date and time
    navigation.goBack();
  };

  const handleReasonChange = (reason: string) => {
    setSelectedReason(reason);
    setShowReasonModal(false);
  };

  return (
    <View style={appointmentStyles.container}>
      <ScrollView 
        style={appointmentStyles.container}
        contentContainerStyle={appointmentStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
  <AppHeader title="Appointment" onBack={() => navigation.goBack()} />

        {/* Divider */}
        <View style={appointmentStyles.divider} />

        {/* Doctor Profile */}
        <View style={appointmentStyles.doctorProfile}>
          <Image source={{ uri: appointmentData.image }} style={appointmentStyles.doctorDetailImage} />
          <View style={appointmentStyles.doctorProfileInfo}>
            <Text style={appointmentStyles.doctorDetailName}>{appointmentData.doctorName}</Text>
            <Text style={appointmentStyles.doctorDetailSpecialty}>{appointmentData.specialty}</Text>
            <View style={appointmentStyles.doctorDetailStats}>
              <View style={appointmentStyles.doctorStat}>
                <Ionicons name="star" size={16} color="#3CB179" />
                <Text style={appointmentStyles.doctorStatText}>{appointmentData.rating}</Text>
              </View>
              <View style={appointmentStyles.doctorStat}>
                <Ionicons name="location-outline" size={16} color="#6B7280" />
                <Text style={appointmentStyles.doctorStatText}>{appointmentData.distance}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={appointmentStyles.divider} />

        {/* Date Section */}
        <View style={appointmentStyles.appointmentSection}>
          <View style={appointmentStyles.sectionHeaderRow}>
            <Text style={appointmentStyles.sectionTitle}>Date</Text>
            <TouchableOpacity onPress={handleDateChange}>
              <Text style={appointmentStyles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
          <Text style={appointmentStyles.appointmentDetail}>
            {appointmentData.date} | {appointmentData.time}
          </Text>
        </View>

        {/* Divider */}
        <View style={appointmentStyles.divider} />

        {/* Reason Section */}
        <View style={appointmentStyles.appointmentSection}>
          <View style={appointmentStyles.sectionHeaderRow}>
            <Text style={appointmentStyles.sectionTitle}>Reason</Text>
            <TouchableOpacity onPress={() => setShowReasonModal(true)}>
              <Text style={appointmentStyles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
          <Text style={appointmentStyles.appointmentDetail}>
            {appointmentData.reason}
          </Text>
        </View>

        {/* Divider */}
        <View style={appointmentStyles.divider} />

        {/* Payment Details */}
        <View style={appointmentStyles.appointmentSection}>
          <Text style={appointmentStyles.sectionTitle}>Payment Detail</Text>
          <View style={appointmentStyles.paymentDetails}>
            {paymentDetails.map((payment, index) => (
              <View key={index} style={appointmentStyles.paymentRow}>
                <Text style={appointmentStyles.paymentItem}>{payment.item}</Text>
                <Text style={appointmentStyles.paymentAmount}>{payment.amount}</Text>
              </View>
            ))}
            <View style={appointmentStyles.totalRow}>
              <Text style={appointmentStyles.totalText}>Total</Text>
              <Text style={appointmentStyles.totalAmount}>{totalAmount}</Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={appointmentStyles.divider} />

        {/* Payment Method */}
        <View style={appointmentStyles.appointmentSection}>
          <View style={appointmentStyles.sectionHeaderRow}>
            <Text style={appointmentStyles.sectionTitle}>Payment Method</Text>
            <TouchableOpacity>
              <Text style={appointmentStyles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
          <View style={appointmentStyles.paymentMethod}>
            <Text style={appointmentStyles.paymentMethodText}>VISA</Text>
          </View>
        </View>
  </ScrollView>

      {/* Fixed Booking Footer */}
      <View style={appointmentStyles.bookingFooter}>
        <View style={appointmentStyles.totalFooter}>
          <Text style={appointmentStyles.totalFooterLabel}>Total</Text>
          <Text style={appointmentStyles.totalFooterAmount}>{totalAmount}</Text>
        </View>
        <TouchableOpacity style={appointmentStyles.bookingButton} onPress={handleBooking}>
          <Text style={appointmentStyles.bookingButtonText}>Booking</Text>
        </TouchableOpacity>
      </View>

      {/* Reason Selection Modal */}
      <Modal
        visible={showReasonModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReasonModal(false)}
      >
        <View style={appointmentStyles.modalOverlay}>
          <View style={appointmentStyles.modalContent}>
            <View style={appointmentStyles.modalHeader}>
              <Text style={appointmentStyles.modalTitle}>Select Reason for Visit</Text>
              <TouchableOpacity onPress={() => setShowReasonModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={appointmentStyles.reasonsList}>
              {commonReasons.map((reason, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    appointmentStyles.reasonItem,
                    selectedReason === reason && appointmentStyles.selectedReasonItem
                  ]}
                  onPress={() => handleReasonChange(reason)}
                >
                  <Text style={[
                    appointmentStyles.reasonText,
                    selectedReason === reason && appointmentStyles.selectedReasonText
                  ]}>
                    {reason}
                  </Text>
                  {selectedReason === reason && (
                    <Ionicons name="checkmark" size={20} color="#3CB179" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={appointmentStyles.doneButton}
              onPress={() => setShowReasonModal(false)}
            >
              <Text style={appointmentStyles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}