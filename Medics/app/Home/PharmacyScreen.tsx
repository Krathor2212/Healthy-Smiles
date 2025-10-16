import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Product, useCartStore } from './stores/cartStores';

export default function PharmacyScreen() {
  const navigation = useNavigation();
  const { getTotalItems } = useCartStore();
  const cartItemsCount = getTotalItems();

  const popularProducts: Product[] = [
    { 
      id: '1', 
      name: 'Panadol', 
      price: '$15.99', 
      size: '20pcs',
      description: 'Panadol is used to treat many conditions such as headache, muscle aches, arthritis, backache, toothaches, colds, and fevers.',
      rating: 4.5
    },
    { 
      id: '2', 
      name: 'Bodrex Herbal', 
      price: '$7.99', 
      size: '100ml',
      description: 'Bodrex Herbal is a natural herbal medicine that helps relieve headaches, fever, and other common ailments.',
      rating: 4.2
    },
    { 
      id: '3', 
      name: 'Konidin', 
      price: '$5.99', 
      size: '3pcs',
      description: 'Konidin is used for the relief of cough and cold symptoms.',
      rating: 4.0
    },
  ];

  const saleProducts: Product[] = [
    { 
      id: '4', 
      name: 'OBH Combi', 
      price: '$9.99', 
      originalPrice: '$16.99', 
      size: '75ml',
      description: 'OBH COMBI is a cough medicine containing Paracetamol, Ephedrine HCl, and Chlorphenamine maleate.',
      rating: 4.3
    },
    { 
      id: '5', 
      name: 'Betadine', 
      price: '$6.99', 
      originalPrice: '$8.99', 
      size: '50ml',
      description: 'Betadine is an antiseptic used for wound disinfection.',
      rating: 4.7
    },
    { 
      id: '6', 
      name: 'Bodrexin', 
      price: '$7.99', 
      originalPrice: '$8.99', 
      size: '75ml',
      description: 'Bodrexin is a fever reducer and pain reliever.',
      rating: 4.1
    },
  ];

  const handleProductPress = (product: Product) => {
    (navigation as any).navigate('DrugDetailScreen', { product: JSON.stringify(product) });
  };

  const handleCartPress = () => {
    (navigation as any).navigate('CartScreen');
  };

  const renderProductItem = (product: Product, isOnSale: boolean = false) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => handleProductPress(product)}
    >
      <View style={styles.productImage}>
        <Text style={styles.productImageText}>💊</Text>
      </View>
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productSize}>{product.size}</Text>
      <View style={styles.priceContainer}>
        <Text style={styles.currentPrice}>{product.price}</Text>
        {isOnSale && product.originalPrice && (
          <Text style={styles.originalPrice}>{product.originalPrice}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => (navigation as any).goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Pharmacy</Text>
          <TouchableOpacity 
            style={styles.cartIcon}
            onPress={handleCartPress}
          >
            <Ionicons name="cart-outline" size={24} color="#000" />
            {cartItemsCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItemsCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search drugs, category..."
          placeholderTextColor="#999"
        />
      </View>

      {/* Prescription Section */}
      <View style={styles.prescriptionSection}>
        <Text style={styles.sectionTitle}>Order quickly with Prescription</Text>
        <TouchableOpacity style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>Upload Prescription</Text>
        </TouchableOpacity>
      </View>

      {/* Popular Products */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Product</Text>
        <FlatList
          data={popularProducts}
          renderItem={({ item }) => renderProductItem(item)}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsList}
        />
      </View>

      {/* Products on Sale */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product on Sale</Text>
        <FlatList
          data={saleProducts}
          renderItem={({ item }) => renderProductItem(item, true)}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsList}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  cartIcon: {
    position: 'relative',
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  prescriptionSection: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    marginLeft: 20,
    color: '#000',
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  productsList: {
    paddingHorizontal: 15,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  productImage: {
    width: 70,
    height: 70,
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'center',
  },
  productImageText: {
    fontSize: 28,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
    color: '#000',
  },
  productSize: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
});