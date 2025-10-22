import { StyleSheet } from "react-native";
const pstyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
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
    padding: 15,
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
    marginBottom: 12,
    color: '#000',
    padding:10,
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
    paddingHorizontal: 8,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 8,
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
    marginBottom: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
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
ratingContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 6,
  alignSelf: 'flex-start',
  marginLeft: 6,
},

ratingText: {
  fontSize: 12,
  color: '#666',
  marginLeft: 4,
},

noResults: {
  alignItems: 'center',
  padding: 20,
},

noResultsText: {
  fontSize: 16,
  color: '#666',
  textAlign: 'center',
},

sectionHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
},

seeAllText: {
  fontSize: 14,
  color: '#3CB179',
  fontWeight: '500',
  paddingRight:10,
},

productImageContainer: {
  position: 'relative',
},

saleBadge: {
  position: 'absolute',
  top: 8,
  left: 8,
  backgroundColor: '#FF4444',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 12,
},

saleBadgeText: {
  color: '#fff',
  fontSize: 10,
  fontWeight: 'bold',
},
});

export default pstyles;