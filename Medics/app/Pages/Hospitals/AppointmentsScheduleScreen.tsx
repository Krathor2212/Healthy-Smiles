// app/schedule.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from "react-native";
import AppHeader from "../../components/AppHeader";
import { StyleSheet } from "react-native";
import type { RootStackParamList } from '../../Navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL || 'http://10.10.112.140:4000';

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: "Confirmed" | "Completed" | "Canceled";
}

type ActiveTab = "upcoming" | "completed" | "canceled";

export default function AppointmentsScheduleScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>("upcoming");
  const [loading, setLoading] = useState(true);

  const handleBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.warn('No token found, user not authenticated');
        setAppointments([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/appointments`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const formattedAppointments: Appointment[] = (data.appointments || []).map((apt: any) => ({
          id: apt.id,
          doctorName: apt.doctorName,
          specialty: apt.specialty,
          date: formatDate(apt.date),
          time: apt.time,
          status: apt.status,
        }));
        
        // Debug: Log appointments with their statuses
        console.log('📋 Fetched appointments:', formattedAppointments.length);
        console.log('📊 Status breakdown:', {
          confirmed: formattedAppointments.filter((a: Appointment) => (a.status || '').toLowerCase() === 'confirmed').length,
          completed: formattedAppointments.filter((a: Appointment) => (a.status || '').toLowerCase() === 'completed').length,
          canceled: formattedAppointments.filter((a: Appointment) => 
            (a.status || '').toLowerCase() === 'canceled' || (a.status || '').toLowerCase() === 'cancelled'
          ).length,
        });
        
        setAppointments(formattedAppointments);
      } else if (response.status === 401) {
        await AsyncStorage.removeItem('token');
        setAppointments([]);
      } else {
        console.error('Failed to fetch appointments:', response.status);
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleCancel = async (appointmentId: string, doctorName: string) => {
    Alert.alert(
      "Cancel Appointment",
      `Are you sure you want to cancel your appointment with ${doctorName}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              if (!token) return;

              const response = await fetch(`${BACKEND_URL}/api/appointments/${appointmentId}`, {
                method: 'PATCH',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'Canceled' }),
              });

              if (response.ok) {
                setAppointments(prev =>
                  prev.map(app =>
                    app.id === appointmentId
                      ? { ...app, status: "Canceled" as const }
                      : app
                  )
                );
                Alert.alert('Success', 'Appointment canceled successfully');
              } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.error || 'Failed to cancel appointment');
              }
            } catch (error) {
              console.error('Error canceling appointment:', error);
              Alert.alert('Error', 'Failed to cancel appointment. Please check your connection.');
            }
          },
        },
      ]
    );
  };

  const handleMarkComplete = async (appointmentId: string, doctorName: string) => {
    Alert.alert(
      "Mark as Complete",
      `Mark appointment with ${doctorName} as completed?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              if (!token) return;

              const response = await fetch(`${BACKEND_URL}/api/appointments/${appointmentId}`, {
                method: 'PATCH',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'Completed' }),
              });

              if (response.ok) {
                setAppointments(prev =>
                  prev.map(app =>
                    app.id === appointmentId
                      ? { ...app, status: "Completed" as const }
                      : app
                  )
                );
                Alert.alert('Success', 'Appointment marked as complete');
              } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.error || 'Failed to mark appointment as complete');
              }
            } catch (error) {
              console.error('Error completing appointment:', error);
              Alert.alert('Error', 'Failed to mark appointment as complete. Please check your connection.');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "#3CB179";
      case "Completed":
        return "#6B7280";
      case "Canceled":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const filteredAppointments = (status: string) => {
    // Case-insensitive comparison to handle both "Canceled" and "Cancelled"
    return appointments.filter(app => 
      (app.status || '').toLowerCase() === status.toLowerCase()
    );
  };

  const getAppointmentsForActiveTab = () => {
    switch (activeTab) {
      case "upcoming":
        return filteredAppointments("Confirmed");
      case "completed":
        return filteredAppointments("Completed");
      case "canceled":
        // Handle both "Canceled" and "Cancelled" spellings
        const cancelled = appointments.filter(app => 
          (app.status || '').toLowerCase() === "canceled" || 
          (app.status || '').toLowerCase() === "cancelled"
        );
        return cancelled;
      default:
        return filteredAppointments("Confirmed");
    }
  };

  const getEmptyStateText = () => {
    switch (activeTab) {
      case "upcoming":
        return "No upcoming appointments";
      case "completed":
        return "No completed appointments";
      case "canceled":
        return "No canceled appointments";
      default:
        return "No appointments";
    }
  };

  const renderAppointmentCard = (appointment: Appointment) => (
    <View key={appointment.id} style={scheduleStyles.appointmentCard}>
      <View style={scheduleStyles.appointmentHeader}>
        <View>
          <Text style={scheduleStyles.doctorName}>{appointment.doctorName}</Text>
          <Text style={scheduleStyles.doctorSpecialty}>{appointment.specialty}</Text>
        </View>
        <View style={[scheduleStyles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
          <Text style={scheduleStyles.statusText}>{appointment.status}</Text>
        </View>
      </View>

      <View style={scheduleStyles.appointmentDetails}>
        <Text style={scheduleStyles.appointmentDate}>{appointment.date}</Text>
        <Text style={scheduleStyles.appointmentTime}>{appointment.time}</Text>
      </View>

      {appointment.status === "Confirmed" && (
        <View style={scheduleStyles.actionButtons}>
          <TouchableOpacity 
            style={scheduleStyles.cancelButton}
            onPress={() => handleCancel(appointment.id, appointment.doctorName)}
          >
            <Text style={scheduleStyles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={scheduleStyles.completeButton}
            onPress={() => handleMarkComplete(appointment.id, appointment.doctorName)}
          >
            <Text style={scheduleStyles.completeButtonText}>Mark Complete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={scheduleStyles.container}>
      <ScrollView style={scheduleStyles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <AppHeader 
          title="Appointments" 
          onBack={handleBack} 
          right={<Ionicons name="notifications-outline" size={24} color="black" />}
          onRightPress={() => navigation.navigate('Notifications')}
        />

        {/* Tab Navigation */}
        <View style={scheduleStyles.tabContainer}>
          <TouchableOpacity 
            style={[
              scheduleStyles.tab,
              activeTab === "upcoming" && scheduleStyles.activeTab
            ]}
            onPress={() => setActiveTab("upcoming")}
          >
            <Text style={[
              scheduleStyles.tabText,
              activeTab === "upcoming" && scheduleStyles.activeTabText
            ]}>
              Upcoming
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              scheduleStyles.tab,
              activeTab === "completed" && scheduleStyles.activeTab
            ]}
            onPress={() => setActiveTab("completed")}
          >
            <Text style={[
              scheduleStyles.tabText,
              activeTab === "completed" && scheduleStyles.activeTabText
            ]}>
              Completed
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              scheduleStyles.tab,
              activeTab === "canceled" && scheduleStyles.activeTab
            ]}
            onPress={() => setActiveTab("canceled")}
          >
            <Text style={[
              scheduleStyles.tabText,
              activeTab === "canceled" && scheduleStyles.activeTabText
            ]}>
              Canceled
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Section */}
        <View style={scheduleStyles.section}>
          <Text style={scheduleStyles.sectionTitle}>
            {activeTab === "upcoming" && "Upcoming Appointments"}
            {activeTab === "completed" && "Completed Appointments"}
            {activeTab === "canceled" && "Canceled Appointments"}
          </Text>

          {/* Appointments for active tab */}
          {loading ? (
            <View style={scheduleStyles.loadingContainer}>
              <ActivityIndicator size="large" color="#3CB179" />
              <Text style={scheduleStyles.loadingText}>Loading appointments...</Text>
            </View>
          ) : getAppointmentsForActiveTab().length > 0 ? (
            getAppointmentsForActiveTab().map(renderAppointmentCard)
          ) : (
            <View style={scheduleStyles.emptyState}>
              <Text style={scheduleStyles.emptyStateText}>{getEmptyStateText()}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const scheduleStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginVertical: 16,
    paddingHorizontal: 20,
    paddingBottom: 80, // Space for bottom navigation
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  statusLabels: {
    flexDirection: "row",
    gap: 16,
  },
  statusLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  appointmentCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3CB179",
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: "#6B7280",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  appointmentDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  appointmentDate: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    marginRight: 8,
  },
  appointmentTime: {
    fontSize: 14,
    color: "#6B7280",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EF4444",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#EF4444",
  },
  rescheduleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3CB179",
    alignItems: "center",
  },
  rescheduleButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3CB179",
  },
  // Add these to your existing scheduleStyles
emptyState: {
  alignItems: 'center',
  padding: 20,
  backgroundColor: '#F9FAFB',
  borderRadius: 12,
  marginTop: 8,
},
emptyStateText: {
  fontSize: 14,
  color: '#6B7280',
  textAlign: 'center',
},
// Add these to your existing scheduleStyles
completeButton: {
  flex: 1,
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: "#3CB179",
  alignItems: "center",
  backgroundColor: "#3CB179",
},
completeButtonText: {
  fontSize: 14,
  fontWeight: "500",
  color: "#FFFFFF",
},
// Add these to your existing scheduleStyles
tabContainer: {
  flexDirection: "row",
  backgroundColor: "#F3F4F6",
  borderRadius: 12,
  padding: 4,
  marginHorizontal: 20,
  marginTop: 20,
  marginBottom: 20,
},
tab: {
  flex: 1,
  paddingVertical: 12,
  paddingHorizontal: 8,
  borderRadius: 8,
  alignItems: "center",
},
activeTab: {
  backgroundColor: "#FFFFFF",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
},
tabText: {
  fontSize: 14,
  fontWeight: "500",
  color: "#6B7280",
},
activeTabText: {
  color: "#3CB179",
  fontWeight: "600",
},
loadingContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 40,
},
loadingText: {
  marginTop: 12,
  fontSize: 16,
  color: '#6B7280',
},
});