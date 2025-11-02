import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import AppHeader from '../../components/AppHeader';
import type { RootStackParamList } from '../../Navigation/types';
import pstyles from '../styles/pharmaStyle';
import { Product, useCartStore } from './stores/cartStores';
import { useAppData } from '../../contexts/AppDataContext';

export default function PharmacyScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { getTotalItems } = useCartStore();
  const cartItemsCount = getTotalItems();
  const [currentSaleIndex, setCurrentSaleIndex] = useState(0);
  const flatListRef = useRef<FlatList<any> | null>(null);

  // Use AppDataContext instead of static data
  const {
    filteredMedicines,
    saleMedicines,
    searchQuery,
    setSearchQuery,
    loading
  } = useAppData();

  // Convert medicines to Product format
  // Fix: Use proper INR symbol instead of garbled character from backend
  const allProducts: Product[] = filteredMedicines.map(med => ({
    id: med.id,
    name: med.name,
    price: `₹${med.price}`,
    originalPrice: med.originalPrice ? `₹${med.originalPrice}` : undefined,
    size: med.size,
    description: med.description,
    rating: med.rating,
    image: med.image || 'https://via.placeholder.com/150/4CAF50/ffffff?text=Medicine'
  }));

  const saleProducts = saleMedicines.map(med => ({
    id: med.id,
    name: med.name,
    price: `₹${med.price}`,
    originalPrice: med.originalPrice ? `₹${med.originalPrice}` : undefined,
    size: med.size,
    description: med.description,
    rating: med.rating,
    image: med.image || 'https://via.placeholder.com/150/4CAF50/ffffff?text=Medicine'
  }));

  // Show more products - top rated for popular, all for featured
  const popularProducts = allProducts
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 10); // Show top 10 rated products
  const featuredProducts = allProducts.slice(0, 10); // Show first 10 products

  useEffect(() => {
    if (searchQuery || saleProducts.length === 0) return;

    const intervalId = setInterval(() => {
      setCurrentSaleIndex(prev => {
        const next = (prev + 1) % saleProducts.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3000);

    return () => clearInterval(intervalId);
  }, [searchQuery, saleProducts.length]);

  const handleProductPress = (product: Product) => {
    (navigation as any).navigate('DrugDetailScreen', { product: JSON.stringify(product) });
  };

  const handleCartPress = () => {
    (navigation as any).navigate('CartScreen');
  };

  const renderProductItem = ({ item, isOnSale = false }: { item: Product; isOnSale?: boolean }) => (
    <TouchableOpacity style={pstyles.productCard} onPress={() => handleProductPress(item)}>
      {isOnSale && (
        <View style={pstyles.saleBadge}>
          <Text style={pstyles.saleBadgeText}>SALE</Text>
        </View>
      )}
      <Text style={pstyles.productName}>{item.name}</Text>
      <Text style={pstyles.productSize}>{item.size}</Text>
      <View style={pstyles.ratingContainer}>
        <Ionicons name="star" size={12} color="#FFD700" />
        <Text style={pstyles.ratingText}>{item.rating}</Text>
      </View>
      <View style={pstyles.priceContainer}>
        <Text style={pstyles.currentPrice}>{item.price}</Text>
        {isOnSale && item.originalPrice && <Text style={pstyles.originalPrice}>{item.originalPrice}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={pstyles.container} showsVerticalScrollIndicator={false}>
        <AppHeader title="Pharmacy" onBack={() => (navigation as any).goBack()} right={
          <TouchableOpacity style={pstyles.cartIcon} onPress={handleCartPress}>
            <Ionicons name="cart-outline" size={24} color="#000" />
            {cartItemsCount > 0 && (
              <View style={pstyles.cartBadge}>
                <Text style={pstyles.cartBadgeText}>{cartItemsCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        } />
        <View style={pstyles.header}>
          <TextInput style={pstyles.searchInput} placeholder="Search drugs, category..." placeholderTextColor="#999" value={searchQuery} onChangeText={setSearchQuery} />
        </View>

        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={{ marginTop: 12, color: '#666' }}>Loading medicines...</Text>
          </View>
        ) : searchQuery ? (
          <View style={pstyles.section}>
            <Text style={pstyles.sectionTitle}>Search Results ({allProducts.length})</Text>
            {allProducts.length > 0 ? (
              <FlatList data={allProducts} renderItem={({ item }) => renderProductItem({ item, isOnSale: !!item.originalPrice })} keyExtractor={i => i.id} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={pstyles.productsList} />
            ) : (
              <View style={pstyles.noResults}>
                <Text style={pstyles.noResultsText}>No products found for "{searchQuery}"</Text>
              </View>
            )}
          </View>
        ) : (
          <>
            {saleProducts.length > 0 && (
              <View style={pstyles.section}>
                <View style={pstyles.sectionHeader}>
                  <Text style={pstyles.sectionTitle}>Products on Sale ({saleProducts.length})</Text>
                  <TouchableOpacity>
                    <Text style={pstyles.seeAllText}>See All</Text>
                  </TouchableOpacity>
                </View>
                <FlatList ref={flatListRef} data={saleProducts} renderItem={({ item }) => renderProductItem({ item, isOnSale: !!item.originalPrice })} keyExtractor={i => i.id} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={pstyles.productsList} onScrollToIndexFailed={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })} />
              </View>
            )}

            <View style={pstyles.section}>
              <Text style={pstyles.sectionTitle}>Popular Products ({popularProducts.length})</Text>
              <FlatList data={popularProducts} renderItem={({ item }) => renderProductItem({ item })} keyExtractor={i => i.id} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={pstyles.productsList} />
            </View>

            <View style={pstyles.section}>
              <Text style={pstyles.sectionTitle}>Featured Products ({featuredProducts.length})</Text>
              <FlatList data={featuredProducts} renderItem={({ item }) => renderProductItem({ item })} keyExtractor={i => i.id} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={pstyles.productsList} />
            </View>
            
            <View style={pstyles.section}>
              <Text style={pstyles.sectionTitle}>All Medicines ({allProducts.length})</Text>
              <FlatList data={allProducts} renderItem={({ item }) => renderProductItem({ item, isOnSale: !!item.originalPrice })} keyExtractor={i => i.id} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={pstyles.productsList} />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}