import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface Authorization {
  id: number;
  doctor_id: string;
  doctor_name: string;
  doctor_specialty?: string;
  authorized_at: string;
  expires_at?: string;
  is_active: boolean;
}

interface AuthorizationContextType {
  authorizations: Authorization[];
  loading: boolean;
  fetchAuthorizations: () => Promise<void>;
  grantAccess: (doctorId: string, expiresInDays?: number) => Promise<void>;
  revokeAccess: (doctorId: string) => Promise<void>;
}

const AuthorizationContext = createContext<AuthorizationContextType | undefined>(undefined);

export const AuthorizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authorizations, setAuthorizations] = useState<Authorization[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAuthorizations = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://10.10.112.140:4000/api/authorizations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Extract authorizations array from response
      const authData = response.data?.authorizations || response.data || [];
      setAuthorizations(Array.isArray(authData) ? authData : []);
    } catch (error) {
      console.error('Failed to fetch authorizations:', error);
      setAuthorizations([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const grantAccess = async (doctorId: string, expiresInDays?: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        'http://10.10.112.140:4000/api/authorizations/grant',
        { doctorId, expiresInDays },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchAuthorizations();
    } catch (error) {
      throw error;
    }
  };

  const revokeAccess = async (doctorId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(
        `http://10.10.112.140:4000/api/authorizations/revoke/${doctorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchAuthorizations();
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthorizationContext.Provider
      value={{ authorizations, loading, fetchAuthorizations, grantAccess, revokeAccess }}
    >
      {children}
    </AuthorizationContext.Provider>
  );
};

export const useAuthorization = () => {
  const context = useContext(AuthorizationContext);
  if (!context) throw new Error('useAuthorization must be used within AuthorizationProvider');
  return context;
};
