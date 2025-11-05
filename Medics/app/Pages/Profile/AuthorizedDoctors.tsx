import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuthorization } from '../../contexts/AuthorizationContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL || 'http://10.10.112.140:4000';

interface Doctor {
  id: string;
  name: string;
  specialty?: string;
  email?: string;
}

const AuthorizedDoctors: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { authorizations, loading, fetchAuthorizations, grantAccess, revokeAccess } = useAuthorization();
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [showDoctorListModal, setShowDoctorListModal] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [expiryDays, setExpiryDays] = useState('30');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAuthorizations();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAuthorizations();
    setRefreshing(false);
  };

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/doctors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(response.data.doctors || []);
      setShowDoctorListModal(true);
    } catch (error: any) {
      console.error('Failed to load doctors:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to load doctors');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleGrantAccess = async () => {
    if (!selectedDoctor) return;

    try {
      const days = expiryDays ? parseInt(expiryDays) : undefined;
      console.log(`📝 Granting access to ${selectedDoctor.name} (ID: ${selectedDoctor.id}) for ${days || 'unlimited'} days`);
      
      await grantAccess(selectedDoctor.id, days);
      
      Alert.alert('Success', `Access granted to Dr. ${selectedDoctor.name}`);
      setShowGrantModal(false);
      setShowDoctorListModal(false);
      setSelectedDoctor(null);
      setExpiryDays('30');
    } catch (error: any) {
      console.error('❌ Failed to grant access:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message || 'Failed to grant access';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleRevoke = (doctorId: string, doctorName: string) => {
    Alert.alert(
      'Revoke Access',
      `Are you sure you want to revoke Dr. ${doctorName}'s access to your medical files?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              await revokeAccess(doctorId);
              Alert.alert('Success', 'Access revoked successfully');
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to revoke access');
            }
          }
        }
      ]
    );
  };

  const selectDoctorForGrant = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowDoctorListModal(false);
    setShowGrantModal(true);
  };

  const renderAuthorizationItem = ({ item }: { item: any }) => {
    const isExpired = item.expires_at && new Date(item.expires_at) < new Date();
    const statusColor = isExpired ? '#FF6B6B' : item.is_active ? '#51CF66' : '#868E96';
    const statusText = isExpired ? 'Expired' : item.is_active ? 'Active' : 'Revoked';

    return (
      <View style={styles.authItem}>
        <View style={styles.authInfo}>
          <Text style={styles.doctorName}>{String(item.doctor_name)}</Text>
          {item.doctor_specialty && (
            <Text style={styles.specialty}>{String(item.doctor_specialty)}</Text>
          )}
          <Text style={styles.dateText}>
            Authorized: {new Date(item.authorized_at).toLocaleDateString()}
          </Text>
          {item.expires_at && (
            <Text style={styles.dateText}>
              Expires: {new Date(item.expires_at).toLocaleDateString()}
            </Text>
          )}
        </View>
        <View style={styles.authActions}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
          {item.is_active && !isExpired && (
            <TouchableOpacity
              style={styles.revokeButton}
              onPress={() => handleRevoke(item.doctor_id, item.doctor_name)}
            >
              <Text style={styles.revokeText}>Revoke</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderDoctorItem = ({ item }: { item: Doctor }) => {
    const isAlreadyAuthorized = authorizations.some(
      auth => auth.doctor_id === item.id && auth.is_active
    );

    return (
      <TouchableOpacity
        style={[styles.doctorItem, isAlreadyAuthorized && styles.doctorItemDisabled]}
        onPress={() => !isAlreadyAuthorized && selectDoctorForGrant(item)}
        disabled={isAlreadyAuthorized}
      >
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorItemName}>{String(item.name)}</Text>
          {item.specialty && (
            <Text style={styles.doctorItemSpecialty}>{String(item.specialty)}</Text>
          )}
          {item.email && (
            <Text style={styles.doctorItemEmail}>{String(item.email)}</Text>
          )}
        </View>
        {isAlreadyAuthorized && (
          <View style={styles.alreadyAuthorizedBadge}>
            <Text style={styles.alreadyAuthorizedText}>Already Authorized</Text>
          </View>
        )}
        {!isAlreadyAuthorized && (
          <Ionicons name="chevron-forward" size={24} color="#868E96" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#212529" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Authorized Doctors</Text>
          <Text style={styles.subtitle}>
            Manage who can access your medical files
          </Text>
        </View>
      </View>

      {/* Grant Access Button */}
      <TouchableOpacity
        style={styles.grantButton}
        onPress={fetchDoctors}
        disabled={loadingDoctors}
      >
        <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
        <Text style={styles.grantButtonText}>
          {loadingDoctors ? 'Loading...' : 'Grant Access to Doctor'}
        </Text>
      </TouchableOpacity>

      {/* Authorizations List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading authorizations...</Text>
        </View>
      ) : authorizations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="shield-checkmark-outline" size={64} color="#CED4DA" />
          <Text style={styles.emptyText}>No authorized doctors yet</Text>
          <Text style={styles.emptySubtext}>
            Grant access to doctors so they can view your medical files
          </Text>
        </View>
      ) : (
        <FlatList
          data={authorizations}
          renderItem={renderAuthorizationItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Doctor Selection Modal */}
      <Modal
        visible={showDoctorListModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDoctorListModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Doctor</Text>
              <TouchableOpacity onPress={() => setShowDoctorListModal(false)}>
                <Ionicons name="close" size={28} color="#212529" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={doctors}
              renderItem={renderDoctorItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.modalList}
            />
          </View>
        </View>
      </Modal>

      {/* Grant Access Modal */}
      <Modal
        visible={showGrantModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGrantModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Grant Access</Text>
              <TouchableOpacity onPress={() => setShowGrantModal(false)}>
                <Ionicons name="close" size={28} color="#212529" />
              </TouchableOpacity>
            </View>
            
            {selectedDoctor && (
              <View style={styles.modalBody}>
                <Text style={styles.label}>Doctor</Text>
                <Text style={styles.selectedDoctorName}>{String(selectedDoctor.name)}</Text>
                {selectedDoctor.specialty && (
                  <Text style={styles.selectedDoctorSpecialty}>{String(selectedDoctor.specialty)}</Text>
                )}

                <Text style={[styles.label, { marginTop: 20 }]}>Expiration (days)</Text>
                <Text style={styles.helperText}>Leave empty for permanent access</Text>
                <TextInput
                  style={styles.input}
                  value={expiryDays}
                  onChangeText={setExpiryDays}
                  keyboardType="numeric"
                  placeholder="30"
                  placeholderTextColor="#ADB5BD"
                />

                <View style={styles.quickOptions}>
                  <TouchableOpacity
                    style={styles.quickOption}
                    onPress={() => setExpiryDays('7')}
                  >
                    <Text style={styles.quickOptionText}>7 days</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickOption}
                    onPress={() => setExpiryDays('30')}
                  >
                    <Text style={styles.quickOptionText}>30 days</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickOption}
                    onPress={() => setExpiryDays('90')}
                  >
                    <Text style={styles.quickOptionText}>90 days</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickOption}
                    onPress={() => setExpiryDays('')}
                  >
                    <Text style={styles.quickOptionText}>Forever</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleGrantAccess}
                >
                  <Text style={styles.confirmButtonText}>Grant Access</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  subtitle: {
    fontSize: 14,
    color: '#868E96',
    marginTop: 2,
  },
  grantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  grantButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#868E96',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#868E96',
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  authItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  authInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#868E96',
    marginTop: 2,
  },
  authActions: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  revokeButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  revokeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  modalList: {
    padding: 16,
  },
  modalBody: {
    padding: 20,
  },
  doctorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
  },
  doctorItemDisabled: {
    opacity: 0.5,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  doctorItemSpecialty: {
    fontSize: 14,
    color: '#495057',
    marginTop: 2,
  },
  doctorItemEmail: {
    fontSize: 12,
    color: '#868E96',
    marginTop: 4,
  },
  alreadyAuthorizedBadge: {
    backgroundColor: '#51CF66',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  alreadyAuthorizedText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#868E96',
    marginBottom: 8,
  },
  selectedDoctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  selectedDoctorSpecialty: {
    fontSize: 14,
    color: '#495057',
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212529',
  },
  quickOptions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 24,
  },
  quickOption: {
    flex: 1,
    padding: 10,
    backgroundColor: '#E9ECEF',
    borderRadius: 8,
    alignItems: 'center',
  },
  quickOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#495057',
  },
  confirmButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AuthorizedDoctors;
