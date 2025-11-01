import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCartStore } from '../Pharmacy/stores/cartStores';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.137.1:4000/api';

interface PrescriptionItem {
  medicineId: string;
  medicineName: string;
  price: number;
  image: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string | null;
}

interface Prescription {
  id: string;
  createdAt: string;
  diagnosis: string | null;
  notes: string | null;
  doctor: {
    id: string;
    name: string;
    specialty: string | null;
  };
  items: PrescriptionItem[];
}

const PrescriptionsScreen = ({ navigation }: any) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { addToCart } = useCartStore();

  const fetchPrescriptions = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.replace('Login');
        return;
      }

      const response = await axios.get(`${API_URL}/patient/prescriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPrescriptions(response.data.prescriptions || []);
    } catch (error: any) {
      console.error('Error fetching prescriptions:', error.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch prescriptions when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchPrescriptions();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPrescriptions();
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleOrderMedicines = (items: PrescriptionItem[]) => {
    try {
      let addedCount = 0;
      
      // Add each medicine to cart
      items.forEach(item => {
        if (item.medicineName && item.price) {
          addToCart({
            id: item.medicineId,
            name: item.medicineName,
            price: `₹${item.price}`,
            size: item.dosage || '',
            description: `${item.frequency} - ${item.duration}`,
            image: item.image || 'https://via.placeholder.com/150',
          });
          addedCount++;
        }
      });

      if (addedCount > 0) {
        Alert.alert(
          'Added to Cart',
          `${addedCount} medicine(s) added to your cart`,
          [
            { text: 'Continue Shopping', style: 'cancel' },
            {
              text: 'View Cart',
              onPress: () => navigation.navigate('CartScreen'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add medicines to cart');
    }
  };

  const renderPrescriptionItem = ({ item }: { item: Prescription }) => {
    const isExpanded = expandedId === item.id;

    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => toggleExpand(item.id)} activeOpacity={0.7}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Ionicons name="medical" size={24} color="#0091F5" />
              <View style={styles.headerText}>
                <Text style={styles.doctorName}>Dr. {item.doctor.name}</Text>
                <Text style={styles.specialty}>{item.doctor.specialty || 'General Physician'}</Text>
              </View>
            </View>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#666"
            />
          </View>

          {/* Date */}
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          </View>

          {/* Medicines Count */}
          <View style={styles.medicineCount}>
            <Ionicons name="medkit-outline" size={16} color="#0091F5" />
            <Text style={styles.medicineCountText}>
              {item.items.length} {item.items.length === 1 ? 'Medicine' : 'Medicines'} Prescribed
            </Text>
          </View>
        </TouchableOpacity>

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            {/* Diagnosis */}
            {item.diagnosis && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Diagnosis</Text>
                <Text style={styles.sectionText}>{item.diagnosis}</Text>
              </View>
            )}

            {/* Medicines */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Prescribed Medicines</Text>
              {item.items.map((medicine, index) => (
                <View key={index} style={styles.medicineItem}>
                  <View style={styles.medicineHeader}>
                    <Text style={styles.medicineName}>{medicine.medicineName}</Text>
                    <Text style={styles.medicinePrice}>₹{medicine.price}</Text>
                  </View>
                  <View style={styles.medicineDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Dosage:</Text>
                      <Text style={styles.detailValue}>{medicine.dosage}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Frequency:</Text>
                      <Text style={styles.detailValue}>{medicine.frequency}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Duration:</Text>
                      <Text style={styles.detailValue}>{medicine.duration}</Text>
                    </View>
                    {medicine.instructions && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Instructions:</Text>
                        <Text style={styles.detailValue}>{medicine.instructions}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {/* Notes */}
            {item.notes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Additional Notes</Text>
                <Text style={styles.sectionText}>{item.notes}</Text>
              </View>
            )}

            {/* Order Button */}
            <TouchableOpacity
              style={styles.orderButton}
              onPress={() => handleOrderMedicines(item.items)}
            >
              <Ionicons name="cart-outline" size={20} color="#FFF" />
              <Text style={styles.orderButtonText}>Order Medicines</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0091F5" />
        <Text style={styles.loadingText}>Loading prescriptions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Prescriptions</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Prescriptions List */}
      {prescriptions.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Ionicons name="document-text-outline" size={80} color="#CCC" />
          <Text style={styles.emptyText}>No Prescriptions Yet</Text>
          <Text style={styles.emptySubtext}>
            Your prescriptions from doctors will appear here
          </Text>
        </ScrollView>
      ) : (
        <FlatList
          data={prescriptions}
          renderItem={renderPrescriptionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'android' ? 20 : 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  specialty: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  medicineCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  medicineCountText: {
    fontSize: 14,
    color: '#0091F5',
    fontWeight: '500',
    marginLeft: 6,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  medicineItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicineName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  medicinePrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0091F5',
  },
  medicineDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    width: 90,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  orderButton: {
    flexDirection: 'row',
    backgroundColor: '#0091F5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  orderButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default PrescriptionsScreen;
