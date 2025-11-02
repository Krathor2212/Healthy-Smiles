/**
 * AppDataContext - Centralized State Management
 * 
 * This context fetches ALL application data once from the backend
 * and provides filtering, searching, and sorting capabilities.
 * 
 * Concept: Fetch Once, Use Everywhere
 * - Single API call to /api/app-data on app load
 * - All components access data without additional API calls
 * - Frontend handles filtering, search, and category selection
 * - Data persists across navigation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewsCount: number;
  experience: string;
  distance: string;
  image: string;
  about: string;
  hospital: string;
  hospitalId: string;
  consultationFee: number;
  availability: {
    monday?: string[];
    tuesday?: string[];
    wednesday?: string[];
    thursday?: string[];
    friday?: string[];
    saturday?: string[];
    sunday?: string[];
  };
  categories: string[];
}

export interface Medicine {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  currency: string;
  size: string;
  description: string;
  rating: number;
  reviewsCount: number;
  image: string;
  category: string;
  manufacturer: string;
  prescription: boolean;
  stock: number;
  onSale: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  speciality: string;
  rating: number;
  reviewsCount: number;
  distance: string;
  latitude: number;
  longitude: number;
  address: string;
  phone: string;
  email: string;
  emergency: boolean;
  departments: string[];
  facilities: string[];
  image: string;
}

export interface Article {
  id: number;
  category: string;
  title: string;
  date: string;
  readTime: string;
  image: string;
  content: string;
  trending?: boolean;
}

export interface Category {
  name: string;
  icon: string;
  count: number;
}

interface AppData {
  doctors: Doctor[];
  medicines: Medicine[];
  hospitals: Hospital[];
  articles: {
    trending: Article[];
    latest: Article[];
  };
  categories: {
    doctors: Category[];
    medicines: Category[];
  };
}

interface AppDataContextType {
  // Raw data
  doctors: Doctor[];
  medicines: Medicine[];
  hospitals: Hospital[];
  articles: { trending: Article[]; latest: Article[] };
  categories: { doctors: Category[]; medicines: Category[] };
  
  // Filtered data
  filteredDoctors: Doctor[];
  filteredMedicines: Medicine[];
  filteredHospitals: Hospital[];
  
  // Special filters
  saleMedicines: Medicine[];
  topDoctors: Doctor[];
  
  // Search and filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  
  // Loading state
  loading: boolean;
  error: string | null;
  
  // Refresh data
  refreshData: () => Promise<void>;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const AppDataContext = createContext<AppDataContextType | null>(null);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Check for token on mount and fetch data if authenticated
  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (token) {
        // User is logged in, fetch data
        console.log('🔑 Auth token found, fetching app data...');
        await fetchAppData();
      } else {
        // User not logged in, try to load cached data only
        console.log('⚠️ No auth token found, loading cached data...');
        const cachedData = await AsyncStorage.getItem('appDataCache');
        if (cachedData) {
          console.log('📦 Loading data from cache');
          setAppData(JSON.parse(cachedData));
        }
      }
    } catch (err) {
      console.error('Error checking auth:', err);
    }
  };

  const fetchAppData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.log('⚠️ No token available, skipping fetch');
        setLoading(false);
        return;
      }

      // ALWAYS clear cache before fetching to ensure fresh data
      console.log('🗑️ Clearing old cached data...');
      await AsyncStorage.removeItem('appDataCache');

      const BASE_URL = Constants.expoConfig?.extra?.BACKEND_URL || 'http://10.10.112.140:4000';

      console.log('🔗 Fetching app data from:', `${BASE_URL}/api/app-data`);

      const response = await fetch(`${BASE_URL}/api/app-data`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid, clear it
          await AsyncStorage.removeItem('token');
          throw new Error('Authentication expired. Please login again.');
        }
        throw new Error(`Failed to fetch app data: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ App data fetched successfully:', {
        doctors: data.doctors?.length || 0,
        doctorNames: data.doctors?.map((d: any) => d.name) || [],
        medicines: data.medicines?.length || 0,
        hospitals: data.hospitals?.length || 0,
        articles: data.articles?.trending?.length || 0
      });
      
      // Validate data structure
      if (!data.doctors || !data.medicines || !data.hospitals) {
        console.warn('⚠️ WARNING: Response missing required fields!', {
          hasDoctors: !!data.doctors,
          hasMedicines: !!data.medicines,
          hasHospitals: !!data.hospitals
        });
      }
      
      setAppData(data);
      
      // Cache NEW data locally for offline access
      await AsyncStorage.setItem('appDataCache', JSON.stringify(data));
      console.log('💾 New data cached successfully');
      
    } catch (err: any) {
      console.error('❌ Failed to fetch app data:', err);
      console.error('   Error details:', err.message);
      console.error('   Error stack:', err.stack);
      setError(err.message);
      
      // Only load cached data if fetch completely failed
      try {
        const cachedData = await AsyncStorage.getItem('appDataCache');
        if (cachedData) {
          console.log('📦 Loading data from cache (fallback)');
          setAppData(JSON.parse(cachedData));
        }
      } catch (cacheErr) {
        console.error('Failed to load cached data:', cacheErr);
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // FILTERED DOCTORS
  // ============================================================================
  
  const filteredDoctors = useMemo(() => {
    if (!appData?.doctors) return [];

    let filtered = appData.doctors;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(doc =>
        doc.categories?.includes(selectedCategory) ||
        doc.specialty.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(query) ||
        doc.specialty.toLowerCase().includes(query) ||
        doc.hospital.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [appData, searchQuery, selectedCategory]);

  // ============================================================================
  // FILTERED MEDICINES
  // ============================================================================

  const filteredMedicines = useMemo(() => {
    if (!appData?.medicines) return [];

    let filtered = appData.medicines;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(med =>
        med.name.toLowerCase().includes(query) ||
        med.description?.toLowerCase().includes(query) ||
        med.category.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(med =>
        med.category === selectedCategory
      );
    }

    return filtered;
  }, [appData, searchQuery, selectedCategory]);

  // ============================================================================
  // FILTERED HOSPITALS
  // ============================================================================

  const filteredHospitals = useMemo(() => {
    if (!appData?.hospitals) return [];

    let filtered = appData.hospitals;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(hosp =>
        hosp.name.toLowerCase().includes(query) ||
        hosp.speciality.toLowerCase().includes(query) ||
        hosp.address.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [appData, searchQuery]);

  // ============================================================================
  // SPECIAL FILTERS
  // ============================================================================

  // Medicines on sale
  const saleMedicines = useMemo(() => {
    return appData?.medicines?.filter(med => med.onSale) || [];
  }, [appData]);

  // Top rated doctors
  const topDoctors = useMemo(() => {
    return appData?.doctors?.filter(doc => doc.rating >= 4.7).slice(0, 5) || [];
  }, [appData]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: AppDataContextType = {
    // Raw data
    doctors: appData?.doctors || [],
    medicines: appData?.medicines || [],
    hospitals: appData?.hospitals || [],
    articles: appData?.articles || { trending: [], latest: [] },
    categories: appData?.categories || { doctors: [], medicines: [] },

    // Filtered data
    filteredDoctors,
    filteredMedicines,
    filteredHospitals,

    // Special filters
    saleMedicines,
    topDoctors,

    // Search and filters
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,

    // Loading state
    loading,
    error,

    // Refresh
    refreshData: fetchAppData
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export const useAppData = () => {
  const context = useContext(AppDataContext);
  
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  
  return context;
};

export default AppDataContext;
