import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../navigation/types';
import { pstyles } from '../styles/pharmaStyle';
import { topDoctorStyles } from '../styles/topDoctorStyles';
import { Product, useCartStore } from './stores/cartStores';

export default function PharmacyScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { getTotalItems } = useCartStore();
  const cartItemsCount = getTotalItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSaleIndex, setCurrentSaleIndex] = useState(0);
  const flatListRef = useRef<FlatList<any> | null>(null);

  const allProducts: Product[] = [
    { id: '1', name: 'Panadol Extra', price: '₹150', originalPrice: '₹180', size: '20 tablets', description: 'Panadol Extra provides effective relief from headaches, fever, and body pains.', rating: 4.5, image: 'https://images.unsplash.com/photo-1585435557343-3b092031d5ad?w=400&h=400&fit=crop' },
    { id: '2', name: 'Bodrex Extra', price: '₹120', size: '10 tablets', description: 'Bodrex Extra provides quick relief from headaches and fever.', rating: 4.2, image: 'https://images.unsplash.com/photo-1599045118108-bf9954418b76?w=400&h=400&fit=crop' },
    { id: '3', name: 'Konidin Cold', price: '₹85', size: '60ml syrup', description: 'Konidin Cold & Cough syrup provides relief from cold, cough, and nasal congestion.', rating: 4.0, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop' },
    { id: '4', name: 'OBH Combi', price: '₹95', originalPrice: '₹120', size: '100ml', description: 'OBH COMBI is a comprehensive cough medicine for dry and wet cough relief.', rating: 4.3, image: 'https://images.unsplash.com/photo-1576671414121-aa0f06ad9d7e?w=400&h=400&fit=crop' },
    { id: '5', name: 'Betadine Solution', price: '₹75', originalPrice: '₹90', size: '50ml', description: 'Betadine antiseptic solution for wound care and skin disinfection.', rating: 4.7, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop' },
  ];

  const saleProducts = allProducts.filter(p => !!p.originalPrice);
  const popularProducts = allProducts.slice(0, 4);
  const featuredProducts = allProducts.slice(0, 4);

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

  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductPress = (product: Product) => {
    (navigation as any).navigate('DrugDetailScreen', { product: JSON.stringify(product) });
  };

  const handleCartPress = () => {
    (navigation as any).navigate('CartScreen');
  };

  const renderProductItem = ({ item, isOnSale = false }: { item: Product; isOnSale?: boolean }) => (
    <TouchableOpacity style={pstyles.productCard} onPress={() => handleProductPress(item)}>
      <View style={pstyles.productImageContainer}>
        <Image source={{ uri: item.image }} style={pstyles.productImage} />
        {isOnSale && (
          <View style={pstyles.saleBadge}>
            <Text style={pstyles.saleBadgeText}>SALE</Text>
          </View>
        )}
      </View>
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
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <ScrollView style={pstyles.container} showsVerticalScrollIndicator={false}>
        <View style={pstyles.header}>
          <View style={pstyles.headerTop}>
            <Pressable onPress={() => (navigation as any).goBack()} style={topDoctorStyles.backButton} android_ripple={{ color: 'rgba(0,0,0,0.06)' }}>
              <Feather name="chevron-left" size={18} color="#1A202C" />
            </Pressable>
            <Text style={pstyles.title}>Pharmacy</Text>
            <TouchableOpacity style={pstyles.cartIcon} onPress={handleCartPress}>
              <Ionicons name="cart-outline" size={24} color="#000" />
              {cartItemsCount > 0 && (
                <View style={pstyles.cartBadge}>
                  <Text style={pstyles.cartBadgeText}>{cartItemsCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <TextInput style={pstyles.searchInput} placeholder="Search drugs, category..." placeholderTextColor="#999" value={searchQuery} onChangeText={setSearchQuery} />
        </View>

        {searchQuery ? (
          <View style={pstyles.section}>
            <Text style={pstyles.sectionTitle}>Search Results ({filteredProducts.length})</Text>
            {filteredProducts.length > 0 ? (
              <FlatList data={filteredProducts} renderItem={({ item }) => renderProductItem({ item, isOnSale: !!item.originalPrice })} keyExtractor={i => i.id} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={pstyles.productsList} />
            ) : (
              <View style={pstyles.noResults}>
                <Text style={pstyles.noResultsText}>No products found for "{searchQuery}"</Text>
              </View>
            )}
          </View>
        ) : (
          <>
            <View style={pstyles.prescriptionSection}>
              <Text style={pstyles.sectionTitle}>Order quickly with Prescription</Text>
              <TouchableOpacity style={pstyles.uploadButton}>
                <Text style={pstyles.uploadButtonText}>Upload Prescription</Text>
              </TouchableOpacity>
            </View>

            <View style={pstyles.section}>
              <View style={pstyles.sectionHeader}>
                <Text style={pstyles.sectionTitle}>Products on Sale</Text>
                <TouchableOpacity>
                  <Text style={pstyles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              <FlatList ref={flatListRef} data={saleProducts} renderItem={({ item }) => renderProductItem({ item, isOnSale: !!item.originalPrice })} keyExtractor={i => i.id} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={pstyles.productsList} onScrollToIndexFailed={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })} />
            </View>

            <View style={pstyles.section}>
              <Text style={pstyles.sectionTitle}>Popular Products</Text>
              <FlatList data={popularProducts} renderItem={({ item }) => renderProductItem({ item })} keyExtractor={i => i.id} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={pstyles.productsList} />
            </View>

            <View style={pstyles.section}>
              <Text style={pstyles.sectionTitle}>Featured Products</Text>
              <FlatList data={featuredProducts} renderItem={({ item }) => renderProductItem({ item })} keyExtractor={i => i.id} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={pstyles.productsList} />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}