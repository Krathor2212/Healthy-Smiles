import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../../Navigation/types';
// Using Ionicons from @expo/vector-icons
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from './stores/cartStores';

// --- Constants ---
const MAIN_GREEN = '#34D399'; // From your other designs
const TEXT_PRIMARY = '#1F2937';
const TEXT_SECONDARY = '#6B7280';
const BG_LIGHT_GRAY = '#F3F4F6';
const WHITE = '#FFFFFF';
const BORDER_COLOR = '#E5E7EB';
const ERROR_RED = '#EF4444';
const SUCCESS_GREEN = '#10B981';

// Helper function to extract numeric price from string like "₹85"
const getPriceNumber = (priceString: string): number => {
  return parseFloat(priceString.replace(/[₹$]/g, '')) || 0;
};

// --- Sub-Components ---

// Header
const CartHeader = ({ onBackPress }: { onBackPress: () => void }) => (
  <View style={styles.headerContainer}>
    <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
      <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>My Cart</Text>
    <View style={styles.headerSpacer} />
  </View>
);

// Cart Item Card
const CartItemCard = ({ item, onIncrease, onDecrease, onRemove }: { 
  item: any; 
  onIncrease: (id: string) => void; 
  onDecrease: (id: string) => void; 
  onRemove: (id: string) => void; 
}) => {
  const price = getPriceNumber(item.product.price);
  const total = price * item.quantity;
  
  return (
    <View style={styles.cardContainer}>
      <Image 
        source={{ uri: item.product.image || 'https://via.placeholder.com/150' }} 
        style={styles.itemImage} 
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.product.name}</Text>
        <Text style={styles.itemDescription}>{item.product.size}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={() => onDecrease(item.product.id)}>
            <Ionicons name="remove-circle" size={24} color={MAIN_GREEN} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => onIncrease(item.product.id)}>
            <Ionicons name="add-circle" size={24} color={MAIN_GREEN} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.itemRight}>
        <TouchableOpacity onPress={() => onRemove(item.product.id)}>
          <Ionicons name="trash-outline" size={20} color={ERROR_RED} />
        </TouchableOpacity>
        <Text style={styles.itemPrice}>₹{total.toFixed(2)}</Text>
      </View>
    </View>
  );
};

// Payment Success Modal
const PaymentSuccessModal = ({ visible, onBackToHome }: { visible: boolean; onBackToHome: () => void }) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="fade"
    onRequestClose={onBackToHome}
  >
    <View style={styles.modalBackdrop}>
      <View style={styles.modalContainer}>
        <View style={styles.successIconContainer}>
          <Ionicons name="checkmark" size={40} color={WHITE} />
        </View>
        <Text style={styles.modalTitle}>Payment Success</Text>
        <Text style={styles.modalSubtitle}>
          Your payment has been successful, you can have a consultation session with your trusted doctor
        </Text>
        <TouchableOpacity
          style={styles.modalButton}
          onPress={onBackToHome}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// --- Main Cart Screen Component ---

const MyCartScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { items, updateQuantity, removeFromCart, clearCart, getTotalPrice } = useCartStore();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- Calculations ---
  const calculations = useMemo(() => {
    const subtotal = getTotalPrice();
    const taxes = subtotal * 0.04; // 4% tax
    const total = subtotal + taxes;
    return { subtotal, taxes, total };
  }, [items, getTotalPrice]);

  // --- Handlers ---
  const handleIncreaseQuantity = (id: string) => {
    const item = items.find(i => i.product.id === id);
    if (item) {
      updateQuantity(id, item.quantity + 1);
    }
  };

  const handleDecreaseQuantity = (id: string) => {
    const item = items.find(i => i.product.id === id);
    if (item && item.quantity > 1) {
      updateQuantity(id, item.quantity - 1);
    }
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleChangePayment = () => {
    console.log("Change payment method");
    // TODO: Navigate to payment methods screen
    // navigation.navigate('PaymentMethods')
  };

  const handleCheckout = async () => {
    try {
      // Get user token (stored as 'token' during login)
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login to complete checkout');
        return;
      }

      const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL || 'http://192.168.137.1:4000';

      // Prepare order data
      const orderItems = items.map(item => ({
        medicineId: item.product.id,
        quantity: item.quantity,
        price: getPriceNumber(item.product.price)
      }));

      const orderData = {
        items: orderItems,
        subtotal: calculations.subtotal,
        tax: calculations.taxes,
        deliveryFee: 0,
        total: calculations.total,
        currency: '₹',
        deliveryAddress: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India'
        },
        paymentMethod: 'Credit Card'
      };

      // Create order in backend
      const response = await fetch(`${BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Order created successfully:', data.order);
        setShowSuccessModal(true);
      } else {
        Alert.alert('Error', data.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    }
  };

  const handleBackToHome = () => {
    setShowSuccessModal(false);
    clearCart(); // Clear cart after successful payment
    (navigation as any).navigate('Home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={BG_LIGHT_GRAY} />
      <CartHeader onBackPress={handleBackPress} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
      >
        {items.length === 0 ? (
          <View style={styles.emptyCart}>
            <Ionicons name="cart-outline" size={80} color="#ccc" />
            <Text style={styles.emptyCartText}>Your cart is empty</Text>
            <Text style={styles.emptyCartSubtext}>
              Add some products from the pharmacy
            </Text>
            <TouchableOpacity 
              style={styles.shopButton}
              onPress={() => (navigation as any).navigate('PharmacyScreen')}
            >
              <Text style={styles.buttonText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {items.map(item => (
              <CartItemCard
                key={item.product.id}
                item={item}
                onIncrease={handleIncreaseQuantity}
                onDecrease={handleDecreaseQuantity}
                onRemove={handleRemoveItem}
              />
            ))}

            {/* Payment Detail */}
            <View style={styles.paymentCard}>
              <Text style={styles.paymentTitle}>Payment Detail</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailText}>Subtotal</Text>
                <Text style={styles.detailText}>₹{calculations.subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailText}>Taxes (4%)</Text>
                <Text style={styles.detailText}>₹{calculations.taxes.toFixed(2)}</Text>
              </View>
              <View style={[styles.detailRow, styles.totalRow]}>
                <Text style={styles.totalText}>Total</Text>
                <Text style={styles.totalText}>₹{calculations.total.toFixed(2)}</Text>
              </View>
            </View>
          </>
        )}

        {/* Payment Method */}
        <View style={styles.paymentCard}>
          <Text style={styles.paymentTitle}>Payment Method</Text>
          <View style={styles.methodRow}>
            <View style={styles.methodLeft}>
              <Ionicons name="card" size={24} color="#1A1F71" />
              <Text style={styles.methodText}>Credit Card</Text>
            </View>
            <TouchableOpacity onPress={handleChangePayment}>
              <Text style={styles.changeButton}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Footer */}
      {items.length > 0 && (
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerTotalLabel}>Total</Text>
            <Text style={styles.footerTotalValue}>₹{calculations.total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.buttonText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}

      <PaymentSuccessModal
        visible={showSuccessModal}
        onBackToHome={handleBackToHome}
      />
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_LIGHT_GRAY,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 120, // Space for footer
    paddingHorizontal: 20,
  },
  // Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: BG_LIGHT_GRAY,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
  },
  headerSpacer: {
    width: 44,
  },
  // Cart Item Card
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: BG_LIGHT_GRAY,
    resizeMode: 'contain',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
  },
  itemDescription: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginVertical: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginHorizontal: 12,
  },
  itemRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: 10,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
  },
  // Payment Cards
  paymentCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    color: TEXT_SECONDARY,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: BORDER_COLOR,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
  },
  methodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodText: {
    fontSize: 16,
    color: TEXT_PRIMARY,
    marginLeft: 12,
  },
  changeButton: {
    fontSize: 16,
    color: MAIN_GREEN,
    fontWeight: 'bold',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderColor: BORDER_COLOR,
    paddingBottom: 30, // For home bar
  },
  footerTotalLabel: {
    fontSize: 16,
    color: TEXT_SECONDARY,
  },
  footerTotalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
  },
  checkoutButton: {
    backgroundColor: MAIN_GREEN,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
  },
  buttonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: SUCCESS_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  modalSubtitle: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  modalButton: {
    backgroundColor: MAIN_GREEN,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  // Empty Cart
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    minHeight: 400,
  },
  emptyCartText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_SECONDARY,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyCartSubtext: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: MAIN_GREEN,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
});

export default MyCartScreen;
