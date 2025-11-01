# Frontend Implementation Guide - Key Sharing Authorization

## Patient Mobile App - Authorization Management Screen

### Step 1: Create Authorization Context
**File**: `Medics/app/contexts/AuthorizationContext.tsx`

```typescript
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
      setAuthorizations(response.data);
    } catch (error) {
      console.error('Failed to fetch authorizations:', error);
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
```

### Step 2: Create Authorization Management Screen
**File**: `Medics/app/Pages/Profile/AuthorizedDoctors.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal
} from 'react-native';
import { useAuthorization } from '../../contexts/AuthorizationContext';

const AuthorizedDoctors: React.FC = () => {
  const { authorizations, loading, fetchAuthorizations, grantAccess, revokeAccess } = useAuthorization();
  const [showGrantModal, setShowGrantModal] = useState(false);

  useEffect(() => {
    fetchAuthorizations();
  }, []);

  const handleRevoke = (doctorId: string, doctorName: string) => {
    Alert.alert(
      'Revoke Access',
      `Are you sure you want to revoke ${doctorName}'s access to your medical files?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              await revokeAccess(doctorId);
              Alert.alert('Success', 'Access revoked successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to revoke access');
            }
          }
        }
      ]
    );
  };

  const renderAuthorizationItem = ({ item }) => {
    const isExpired = item.expires_at && new Date(item.expires_at) < new Date();
    const statusColor = isExpired ? '#FF6B6B' : item.is_active ? '#51CF66' : '#868E96';
    const statusText = isExpired ? 'Expired' : item.is_active ? 'Active' : 'Revoked';

    return (
      <View style={styles.authItem}>
        <View style={styles.authInfo}>
          <Text style={styles.doctorName}>{item.doctor_name}</Text>
          {item.doctor_specialty && (
            <Text style={styles.specialty}>{item.doctor_specialty}</Text>
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Authorized Doctors</Text>
      <Text style={styles.subtitle}>
        Manage which doctors can access your medical files
      </Text>

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : authorizations.length === 0 ? (
        <Text style={styles.emptyText}>No authorized doctors yet</Text>
      ) : (
        <FlatList
          data={authorizations}
          renderItem={renderAuthorizationItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#868E96',
    marginBottom: 16
  },
  listContent: {
    paddingBottom: 16
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
    elevation: 3
  },
  authInfo: {
    flex: 1
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4
  },
  specialty: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8
  },
  dateText: {
    fontSize: 12,
    color: '#868E96',
    marginTop: 2
  },
  authActions: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 8
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  revokeButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  revokeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500'
  },
  loadingText: {
    textAlign: 'center',
    color: '#868E96',
    marginTop: 32
  },
  emptyText: {
    textAlign: 'center',
    color: '#868E96',
    marginTop: 32,
    fontSize: 16
  }
});

export default AuthorizedDoctors;
```

### Step 3: Add to Navigation
Update your profile navigation to include the AuthorizedDoctors screen.

### Step 4: Add Authorization Provider to App Root
**File**: `Medics/app/_layout.tsx` (or wherever you have your root providers)

```typescript
import { AuthorizationProvider } from './contexts/AuthorizationContext';

// Wrap your app with AuthorizationProvider
<AuthorizationProvider>
  {/* Your existing app components */}
</AuthorizationProvider>
```

## Doctor Web App - Authorization Status Display

### Update Patients.tsx

**File**: `Medics-Doctor/src/pages/Patients.tsx`

Add authorization fetching and display:

```typescript
// Add to state
const [authorizations, setAuthorizations] = useState<Record<string, any>>({});

// Add fetch function
const fetchAuthorizations = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://10.10.112.140:4000/api/authorizations', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Convert array to map for quick lookup
    const authMap = response.data.reduce((acc, auth) => {
      acc[auth.patient_id] = auth;
      return acc;
    }, {});
    setAuthorizations(authMap);
  } catch (error) {
    console.error('Failed to fetch authorizations:', error);
  }
};

// Call in useEffect
useEffect(() => {
  fetchPatients();
  fetchAuthorizations();
}, []);

// Add authorization status badge in patient list
{authorization && authorization.is_active ? (
  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
    Authorized ✓
    {authorization.expires_at && (
      <span className="text-xs ml-1">
        (Expires: {new Date(authorization.expires_at).toLocaleDateString()})
      </span>
    )}
  </span>
) : (
  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
    Not Authorized
  </span>
)}

// Update file view error handling
const handleViewFile = async (fileId: string, filename: string) => {
  try {
    // ... existing code ...
  } catch (error: any) {
    if (error.response?.status === 403) {
      setError('You are not authorized to view this file. Please request access from the patient.');
    } else {
      setError(error.response?.data?.error || 'Failed to load file');
    }
  }
};
```

## Testing Guide

### Test Flow 1: Grant and View
1. Login as patient in mobile app
2. Navigate to "Authorized Doctors"
3. Click "Grant Access" and select a doctor
4. Login as that doctor in web app
5. Go to Patients page
6. Click on the patient
7. Verify "Authorized ✓" badge appears
8. Click "View" on a medical file
9. File should open successfully

### Test Flow 2: Revoke
1. As patient, go to "Authorized Doctors"
2. Click "Revoke" on an authorized doctor
3. Confirm revocation
4. As doctor, try to view a file
5. Should get "Not authorized" error

### Test Flow 3: Expiration
1. As patient, grant access with expiresInDays: 1
2. Manually update `expires_at` in database to past date
3. As doctor, try to view file
4. Should get authorization error

## API Documentation

### Grant Access
```
POST /api/authorizations/grant
Headers: { Authorization: 'Bearer <token>' }
Body: {
  doctorId: string,
  expiresInDays?: number  // Optional, e.g., 30, 90, 365
}
Response: { message: 'Access granted successfully', authorization: {...} }
```

### Revoke Access
```
DELETE /api/authorizations/revoke/:doctorId
Headers: { Authorization: 'Bearer <token>' }
Response: { message: 'Access revoked successfully' }
```

### List Authorizations
```
GET /api/authorizations
Headers: { Authorization: 'Bearer <token>' }
Response: [
  {
    id: number,
    patient_id: string,
    doctor_id: string,
    doctor_name: string,  // For patients
    patient_name: string,  // For doctors
    authorized_at: string,
    expires_at: string | null,
    is_active: boolean
  }
]
```

---

**Next Steps**:
1. Create AuthorizationContext.tsx
2. Create AuthorizedDoctors.tsx screen
3. Update app navigation
4. Add AuthorizationProvider to app root
5. Update Patients.tsx with authorization status
6. Test full flow end-to-end
