# Medics App - API Endpoints Documentation

## Overview

This document defines **optimized API endpoints** for the Medics React Native application. Following the **centralized state management pattern** (like ShopContext), we minimize the number of API calls by fetching bulk data once and managing it on the frontend.

### Key Optimization Principles
- ✅ **Fetch Once, Use Everywhere** - Single API call to load all data
- ✅ **Context-Based Management** - Frontend context handles filtering, search, sorting
- ✅ **Minimal Backend Calls** - Only essential operations hit the backend
- ✅ **JSON Request/Response** - All data transferred in JSON format
- ✅ **JWT Authentication** - Secure endpoints with Bearer tokens

---

## Base Configuration

```javascript
// Base URL Configuration
const BASE_URL = Constants.expoConfig?.extra?.BACKEND_URL || 'http://localhost:4000';

// Headers Template
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}` // For protected routes
};
```

---

## 1. Authentication Endpoints

### 1.1 Register New User
**Endpoint:** `POST /register`

**Purpose:** Create a new patient account and receive JWT token

**Request:**
```json
{
  "role": "patient",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "patient",
    "avatar": null,
    "phone": null,
    "dob": null,
    "height": null,
    "weight": null,
    "createdAt": "2025-11-01T10:30:00Z"
  }
}
```

**Error Responses:**
- `400`: Missing required fields
- `409`: Email already exists
- `500`: Server error

**Frontend Usage:**
```javascript
const handleSignup = async (name, email, password) => {
  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'patient', name, email, password })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Store token and user data
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('userId', data.id);
    await AsyncStorage.setItem('userProfile', JSON.stringify(data.user));
  }
};
```

---

### 1.2 Login
**Endpoint:** `POST /login`

**Purpose:** Authenticate existing user and receive JWT token

**Request:**
```json
{
  "role": "patient",
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "patient",
    "avatar": "https://...",
    "phone": "+1234567890",
    "dob": "1990-05-15",
    "height": "5'10\"",
    "weight": "75kg",
    "stats": {
      "appointmentsCount": 12,
      "filesCount": 5,
      "lastVisit": "2025-10-25"
    }
  }
}
```

**Error Responses:**
- `400`: Missing credentials
- `401`: Invalid email or password
- `500`: Server error

---

### 1.3 Forgot Password - Request Reset Code
**Endpoint:** `POST /auth/forgot-password`

**Purpose:** Send verification code to user's email

**Request:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Verification code sent to your email",
  "expiresIn": 300 // seconds (5 minutes)
}
```

---

### 1.4 Verify Reset Code
**Endpoint:** `POST /auth/verify-code`

**Purpose:** Verify the 4-digit code sent via email

**Request:**
```json
{
  "email": "john.doe@example.com",
  "code": "1234"
}
```

**Response (200):**
```json
{
  "success": true,
  "resetToken": "temp-reset-token-xyz123" // Short-lived token for password reset
}
```

**Error Responses:**
- `400`: Invalid or expired code
- `404`: Email not found

---

### 1.5 Reset Password
**Endpoint:** `POST /auth/reset-password`

**Purpose:** Set new password using reset token

**Request:**
```json
{
  "resetToken": "temp-reset-token-xyz123",
  "newPassword": "NewSecurePass456!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

## 2. Core Data Endpoints (Centralized Context Pattern)

### 2.1 Get App Data (Centralized Endpoint)
**Endpoint:** `GET /api/app-data`

**Purpose:** Fetch ALL application data in a single call - doctors, medicines, hospitals, articles. Frontend contexts will filter/search this data.

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "doctors": [
    {
      "id": "1",
      "name": "Dr. Sarah Johnson",
      "specialty": "General Physician",
      "rating": 4.8,
      "reviewsCount": 234,
      "experience": "10 years",
      "distance": "500m",
      "image": "https://example.com/doctors/sarah.jpg",
      "about": "Board-certified general physician...",
      "hospital": "Apollo Hospitals",
      "hospitalId": "h1",
      "consultationFee": 500,
      "availability": {
        "monday": ["09:00", "10:00", "11:00", "14:00", "15:00"],
        "tuesday": ["09:00", "10:00", "11:00", "14:00", "15:00"],
        "wednesday": ["09:00", "10:00", "11:00"],
        "thursday": ["09:00", "10:00", "11:00", "14:00", "15:00"],
        "friday": ["09:00", "10:00", "11:00", "14:00", "15:00"],
        "saturday": ["09:00", "10:00", "11:00"],
        "sunday": []
      },
      "categories": ["General", "Family Medicine"]
    }
    // ... more doctors
  ],
  "medicines": [
    {
      "id": "m1",
      "name": "Panadol Extra",
      "price": 150,
      "originalPrice": 180,
      "currency": "₹",
      "size": "20 tablets",
      "description": "Effective relief from headaches, fever, and body pains",
      "rating": 4.5,
      "reviewsCount": 189,
      "image": "https://example.com/medicines/panadol.jpg",
      "category": "Pain Relief",
      "manufacturer": "GSK",
      "prescription": false,
      "stock": 150,
      "onSale": true
    }
    // ... more medicines
  ],
  "hospitals": [
    {
      "id": "h1",
      "name": "Apollo Hospitals",
      "speciality": "Multi-Speciality",
      "rating": 4.7,
      "reviewsCount": 567,
      "distance": "2.5km",
      "latitude": 13.0067,
      "longitude": 80.2206,
      "address": "21 Greams Lane, Chennai",
      "phone": "+91-44-2829-3333",
      "email": "info@apollohospitals.com",
      "emergency": true,
      "departments": ["Cardiology", "Neurology", "Orthopedics", "Pediatrics"],
      "facilities": ["24/7 Emergency", "ICU", "Pharmacy", "Blood Bank", "Parking"],
      "image": "https://example.com/hospitals/apollo.jpg"
    }
    // ... more hospitals
  ],
  "articles": {
    "trending": [
      {
        "id": 1,
        "category": "Health",
        "title": "5 Ways to Boost Your Heart Health",
        "date": "2025-10-28",
        "readTime": "5 min",
        "image": "https://example.com/articles/heart-health.jpg",
        "content": "Detailed article content...",
        "trending": true
      }
    ],
    "latest": [
      {
        "id": 2,
        "category": "Wellness",
        "title": "Mental Health in Modern Times",
        "date": "2025-10-30",
        "readTime": "8 min",
        "content": "Article content..."
      }
    ]
  },
  "categories": {
    "doctors": [
      { "name": "General", "icon": "medical-outline", "count": 45 },
      { "name": "Lungs Specialist", "icon": "medkit-outline", "count": 12 },
      { "name": "Dentist", "icon": "person-circle-outline", "count": 23 },
      { "name": "Psychiatrist", "icon": "person-outline", "count": 18 },
      { "name": "Covid-19", "icon": "pulse-outline", "count": 8 },
      { "name": "Surgeon", "icon": "cut-outline", "count": 15 },
      { "name": "Cardiologist", "icon": "heart-outline", "count": 20 }
    ],
    "medicines": [
      { "name": "Pain Relief", "count": 34 },
      { "name": "Cold & Flu", "count": 28 },
      { "name": "Vitamins", "count": 42 },
      { "name": "Antibiotics", "count": 15 }
    ]
  }
}
```

**Frontend Context Implementation:**
```javascript
// AppDataContext.tsx
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const AppDataContext = createContext(null);

export const AppDataProvider = ({ children }) => {
  const [appData, setAppData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch once on app load
  useEffect(() => {
    const fetchAppData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const BASE_URL = Constants.expoConfig?.extra?.BACKEND_URL || 'http://localhost:4000';
        
        const response = await fetch(`${BASE_URL}/api/app-data`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        setAppData(data);
      } catch (error) {
        console.error('Failed to fetch app data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppData();
  }, []);

  // Filtered doctors based on search and category
  const filteredDoctors = useMemo(() => {
    if (!appData?.doctors) return [];
    
    let filtered = appData.doctors;
    
    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(doc => 
        doc.categories?.includes(selectedCategory)
      );
    }
    
    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [appData, searchQuery, selectedCategory]);

  // Filtered medicines
  const filteredMedicines = useMemo(() => {
    if (!appData?.medicines) return [];
    
    return appData.medicines.filter(med =>
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [appData, searchQuery]);

  // Get medicines on sale
  const saleMedicines = useMemo(() => {
    return appData?.medicines?.filter(med => med.onSale) || [];
  }, [appData]);

  const value = {
    doctors: appData?.doctors || [],
    medicines: appData?.medicines || [],
    hospitals: appData?.hospitals || [],
    articles: appData?.articles || {},
    categories: appData?.categories || {},
    filteredDoctors,
    filteredMedicines,
    saleMedicines,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    loading
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return context;
};
```

**Usage in Screens:**
```javascript
// FindDoctorsScreen.tsx
const FindDoctorsScreen = () => {
  const { filteredDoctors, setSearchQuery, setSelectedCategory } = useAppData();
  
  // No API call needed - data already loaded!
  return (
    <View>
      <TextInput
        placeholder="Search doctors..."
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredDoctors}
        renderItem={({ item }) => <DoctorCard doctor={item} />}
      />
    </View>
  );
};
```

---

## 3. User Profile Endpoints

### 3.1 Get User Profile
**Endpoint:** `GET /api/user/profile`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "avatar": "https://example.com/avatars/user123.jpg",
  "dob": "1990-05-15",
  "height": "5'10\"",
  "weight": "75kg",
  "stats": {
    "appointmentsCount": 12,
    "filesCount": 5,
    "completedAppointments": 8,
    "upcomingAppointments": 4
  }
}
```

---

### 3.2 Update User Profile
**Endpoint:** `PUT /api/user/profile`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request:**
```json
{
  "name": "John Doe",
  "phone": "+1234567890",
  "dob": "1990-05-15",
  "height": "5'10\"",
  "weight": "75kg",
  "avatar": "base64_encoded_image_string" // Optional: base64 image for avatar upload
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "avatar": "https://example.com/avatars/user123.jpg",
    "dob": "1990-05-15",
    "height": "5'10\"",
    "weight": "75kg"
  }
}
```

**Frontend Usage:**
```javascript
const updateProfile = async (profileData) => {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/api/user/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });
  
  const data = await response.json();
  if (response.ok) {
    await AsyncStorage.setItem('userProfile', JSON.stringify(data.user));
  }
};
```

---

## 4. Appointment Endpoints

### 4.1 Get User Appointments
**Endpoint:** `GET /api/appointments`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Query Parameters:**
- `status` (optional): `upcoming`, `completed`, `canceled`, `all` (default: `all`)

**Response (200):**
```json
{
  "appointments": [
    {
      "id": "apt-001",
      "doctorId": "1",
      "doctorName": "Dr. Sarah Johnson",
      "doctorImage": "https://example.com/doctors/sarah.jpg",
      "specialty": "General Physician",
      "date": "2025-11-15",
      "time": "10:00 AM",
      "reason": "General Consultation",
      "status": "Confirmed",
      "hospitalName": "Apollo Hospitals",
      "hospitalAddress": "21 Greams Lane, Chennai",
      "payment": {
        "consultationFee": 500,
        "adminFee": 50,
        "discount": 0,
        "total": 550,
        "currency": "₹",
        "isPaid": true,
        "paymentMethod": "Card",
        "transactionId": "TXN123456789"
      },
      "createdAt": "2025-11-01T10:00:00Z"
    }
  ]
}
```

---

### 4.2 Create Appointment
**Endpoint:** `POST /api/appointments`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request:**
```json
{
  "doctorId": "1",
  "date": "2025-11-15",
  "time": "10:00 AM",
  "reason": "General Consultation",
  "payment": {
    "consultationFee": 500,
    "adminFee": 50,
    "discount": 0,
    "total": 550,
    "paymentMethod": "Card"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "appointment": {
    "id": "apt-001",
    "doctorId": "1",
    "doctorName": "Dr. Sarah Johnson",
    "specialty": "General Physician",
    "date": "2025-11-15",
    "time": "10:00 AM",
    "reason": "General Consultation",
    "status": "Confirmed",
    "payment": {
      "total": 550,
      "currency": "₹",
      "isPaid": true,
      "transactionId": "TXN123456789"
    }
  }
}
```

---

### 4.3 Update Appointment Status
**Endpoint:** `PATCH /api/appointments/:appointmentId`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request:**
```json
{
  "status": "Canceled" // or "Completed", "Rescheduled"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Appointment status updated",
  "appointment": {
    "id": "apt-001",
    "status": "Canceled"
  }
}
```

---

## 5. Medical Files Endpoints

### 5.1 Get User Medical Files
**Endpoint:** `GET /api/files/medical`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (200):**
```json
{
  "files": [
    {
      "id": "file-001",
      "name": "Blood Test Results - Oct 2025.pdf",
      "uri": "https://example.com/files/encrypted/file001",
      "size": 245678,
      "mimeType": "application/pdf",
      "createdAt": "2025-10-25T14:30:00Z",
      "uploadedBy": "patient"
    },
    {
      "id": "file-002",
      "name": "X-Ray Chest.jpg",
      "uri": "https://example.com/files/encrypted/file002",
      "size": 1245678,
      "mimeType": "image/jpeg",
      "createdAt": "2025-10-20T09:15:00Z",
      "uploadedBy": "doctor"
    }
  ]
}
```

---

### 5.2 Upload Medical File
**Endpoint:** `POST /api/files/medical/upload`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "multipart/form-data"
}
```

**Form Data:**
- `file`: File binary
- `description`: String (optional)
- `patientId`: String (current user's ID)

**Response (201):**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "fileId": "file-003",
  "file": {
    "id": "file-003",
    "name": "MRI Scan.pdf",
    "uri": "https://example.com/files/encrypted/file003",
    "size": 3456789,
    "mimeType": "application/pdf",
    "createdAt": "2025-11-01T11:00:00Z"
  }
}
```

**Frontend Usage:**
```javascript
const uploadFile = async (fileUri, description) => {
  const token = await AsyncStorage.getItem('token');
  const userId = await AsyncStorage.getItem('userId');
  
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    type: 'application/pdf',
    name: 'document.pdf'
  });
  formData.append('patientId', userId);
  formData.append('description', description);
  
  const response = await fetch(`${BASE_URL}/api/files/medical/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    },
    body: formData
  });
  
  return await response.json();
};
```

---

### 5.3 Delete Medical File
**Endpoint:** `DELETE /api/files/medical/:fileId`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

## 6. Chat/Messaging Endpoints

### 6.1 Get Chat Contacts
**Endpoint:** `GET /api/chats`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (200):**
```json
{
  "contacts": [
    {
      "id": "chat-001",
      "doctorId": "1",
      "doctorName": "Dr. Sarah Johnson",
      "doctorAvatar": "https://example.com/doctors/sarah.jpg",
      "doctorRating": 4.8,
      "lastMessage": "Okay, see you then!",
      "lastMessageTime": "10:30 AM",
      "unreadCount": 0,
      "isOnline": true
    },
    {
      "id": "chat-002",
      "doctorId": "2",
      "doctorName": "Dr. Michael Chen",
      "doctorAvatar": "https://example.com/doctors/michael.jpg",
      "doctorRating": 4.6,
      "lastMessage": "Take care!",
      "lastMessageTime": "Yesterday",
      "unreadCount": 2,
      "isOnline": false
    }
  ]
}
```

---

### 6.2 Get Chat Messages
**Endpoint:** `GET /api/chats/:chatId/messages`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Query Parameters:**
- `limit` (optional): Number of messages to return (default: 50)
- `before` (optional): Message ID to fetch messages before (pagination)

**Response (200):**
```json
{
  "chatId": "chat-001",
  "doctorName": "Dr. Sarah Johnson",
  "doctorAvatar": "https://example.com/doctors/sarah.jpg",
  "messages": [
    {
      "id": "msg-001",
      "text": "Hello doctor, I have a question about my medication",
      "time": "10:31 AM",
      "sender": "user",
      "createdAt": "2025-11-01T10:31:00Z"
    },
    {
      "id": "msg-002",
      "text": "Of course! What would you like to know?",
      "time": "10:31 AM",
      "sender": "doctor",
      "createdAt": "2025-11-01T10:31:30Z"
    }
  ],
  "hasMore": false
}
```

---

### 6.3 Send Message
**Endpoint:** `POST /api/chats/:chatId/messages`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request:**
```json
{
  "text": "Thank you for your help!"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": {
    "id": "msg-003",
    "text": "Thank you for your help!",
    "time": "10:35 AM",
    "sender": "user",
    "createdAt": "2025-11-01T10:35:00Z"
  }
}
```

**Real-time Updates:**
Use WebSocket connection for real-time message delivery:
```javascript
// WebSocket connection for real-time chat
const ws = new WebSocket(`wss://example.com/chat?token=${token}`);

ws.onmessage = (event) => {
  const newMessage = JSON.parse(event.data);
  // Update chat UI with new message
};
```

---

## 7. Pharmacy/Orders Endpoints

### 7.1 Create Order
**Endpoint:** `POST /api/orders`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request:**
```json
{
  "items": [
    {
      "medicineId": "m1",
      "quantity": 2,
      "price": 150
    },
    {
      "medicineId": "m4",
      "quantity": 1,
      "price": 95
    }
  ],
  "subtotal": 395,
  "tax": 15.80,
  "deliveryFee": 40,
  "total": 450.80,
  "currency": "₹",
  "deliveryAddress": {
    "street": "123 Main Street",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "zipCode": "600001",
    "phone": "+91-9876543210"
  },
  "paymentMethod": "Card"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "order": {
    "id": "order-001",
    "orderNumber": "ORD-20251101-001",
    "items": [...],
    "total": 450.80,
    "currency": "₹",
    "status": "Processing",
    "estimatedDelivery": "2025-11-03",
    "trackingNumber": "TRK123456789",
    "createdAt": "2025-11-01T11:00:00Z"
  }
}
```

---

### 7.2 Get User Orders
**Endpoint:** `GET /api/orders`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Query Parameters:**
- `status` (optional): `Processing`, `Shipped`, `Delivered`, `Canceled`

**Response (200):**
```json
{
  "orders": [
    {
      "id": "order-001",
      "orderNumber": "ORD-20251101-001",
      "items": [
        {
          "medicineId": "m1",
          "medicineName": "Panadol Extra",
          "quantity": 2,
          "price": 150,
          "image": "https://example.com/medicines/panadol.jpg"
        }
      ],
      "total": 450.80,
      "currency": "₹",
      "status": "Delivered",
      "deliveredAt": "2025-11-03T15:30:00Z",
      "createdAt": "2025-11-01T11:00:00Z"
    }
  ]
}
```

---

## 8. Payment History Endpoint

### 8.1 Get Payment History
**Endpoint:** `GET /api/payments`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Query Parameters:**
- `type` (optional): `upcoming`, `completed`, `all` (default: `all`)

**Response (200):**
```json
{
  "payments": {
    "upcoming": [
      {
        "id": "pay-001",
        "title": "Dr. Sarah Johnson",
        "description": "Consultation with Dr. Johnson",
        "date": "2025-11-15",
        "amount": 800,
        "currency": "₹",
        "status": "Pending",
        "type": "consultation",
        "relatedId": "apt-001"
      }
    ],
    "completed": [
      {
        "id": "pay-002",
        "title": "Dr. Sarah Johnson",
        "description": "Paid for consultation",
        "date": "2025-10-25",
        "amount": 120,
        "currency": "₹",
        "status": "Paid",
        "type": "consultation",
        "paymentMethod": "Card",
        "transactionId": "TXN123456789"
      },
      {
        "id": "pay-003",
        "title": "Pharmacy Order",
        "description": "Medicine order #ORD-001",
        "date": "2025-10-20",
        "amount": 450.80,
        "currency": "₹",
        "status": "Paid",
        "type": "pharmacy",
        "paymentMethod": "UPI",
        "transactionId": "TXN987654321"
      }
    ]
  }
}
```

---

## 9. Notifications Endpoint

### 9.1 Get Notifications
**Endpoint:** `GET /api/notifications`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Query Parameters:**
- `unreadOnly` (optional): `true` or `false` (default: `false`)

**Response (200):**
```json
{
  "notifications": {
    "new": [
      {
        "id": "notif-001",
        "title": "Appointment Confirmed",
        "description": "Your appointment with Dr. Sarah Johnson is confirmed for Nov 10.",
        "time": "10:30 AM",
        "type": "appointment",
        "isRead": false,
        "iconName": "calendar",
        "iconColor": "#34D399",
        "relatedId": "apt-001",
        "createdAt": "2025-11-01T10:30:00Z"
      }
    ],
    "earlier": [
      {
        "id": "notif-002",
        "title": "Payment Successful",
        "description": "Your payment of ₹800 has been successfully processed.",
        "time": "Yesterday",
        "type": "payment",
        "isRead": true,
        "iconName": "check-circle",
        "iconColor": "#34D399",
        "createdAt": "2025-10-31T14:20:00Z"
      }
    ]
  },
  "unreadCount": 1
}
```

---

### 9.2 Mark Notification as Read
**Endpoint:** `PATCH /api/notifications/:notificationId`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request:**
```json
{
  "isRead": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

## 10. FAQ Endpoint

### 10.1 Get FAQs
**Endpoint:** `GET /api/faqs`

**No authentication required**

**Response (200):**
```json
{
  "faqs": [
    {
      "id": 1,
      "question": "What time is your customer service available?",
      "answer": "Our customer service is available 24/7 to assist you with any questions or concerns."
    },
    {
      "id": 2,
      "question": "How do I book an appointment?",
      "answer": "You can book an appointment by searching for doctors in your specialty and selecting an available time slot."
    },
    {
      "id": 3,
      "question": "Can I cancel my appointment?",
      "answer": "Yes, you can cancel appointments up to 2 hours before the scheduled time from the Appointments page."
    }
  ]
}
```

---

## Summary of Optimized Endpoints

### Core Principle: Fetch Once, Use Everywhere

| Category | Endpoint | Method | Purpose |
|----------|----------|--------|---------|
| **Auth** | `/register` | POST | Register new user |
| **Auth** | `/login` | POST | Login user |
| **Auth** | `/auth/forgot-password` | POST | Request password reset code |
| **Auth** | `/auth/verify-code` | POST | Verify reset code |
| **Auth** | `/auth/reset-password` | POST | Reset password |
| **Core Data** | `/api/app-data` | GET | ⭐ **Fetch ALL data once** (doctors, medicines, hospitals, articles) |
| **Profile** | `/api/user/profile` | GET | Get user profile |
| **Profile** | `/api/user/profile` | PUT | Update profile |
| **Appointments** | `/api/appointments` | GET | Get all appointments |
| **Appointments** | `/api/appointments` | POST | Create appointment |
| **Appointments** | `/api/appointments/:id` | PATCH | Update appointment status |
| **Files** | `/api/files/medical` | GET | Get medical files |
| **Files** | `/api/files/medical/upload` | POST | Upload medical file |
| **Files** | `/api/files/medical/:id` | DELETE | Delete file |
| **Chat** | `/api/chats` | GET | Get chat contacts |
| **Chat** | `/api/chats/:id/messages` | GET | Get chat messages |
| **Chat** | `/api/chats/:id/messages` | POST | Send message |
| **Orders** | `/api/orders` | GET | Get user orders |
| **Orders** | `/api/orders` | POST | Create order |
| **Payments** | `/api/payments` | GET | Get payment history |
| **Notifications** | `/api/notifications` | GET | Get notifications |
| **Notifications** | `/api/notifications/:id` | PATCH | Mark as read |
| **FAQ** | `/api/faqs` | GET | Get FAQs |

**Total: 21 optimized endpoints** (vs 50+ if each feature had separate endpoints)

---

## Frontend Context Architecture

### Recommended Contexts

1. **AppDataContext** - Doctors, Medicines, Hospitals, Articles
2. **AuthContext** - User authentication state
3. **CartContext** - Pharmacy cart (already implemented with Zustand)
4. **AppointmentsContext** - User appointments
5. **ChatContext** - Chat contacts and messages

### Benefits

✅ **Reduced Network Calls** - 1 call vs 10+ calls  
✅ **Faster UI** - Instant search/filter without API delays  
✅ **Offline Support** - Cache data for offline access  
✅ **Better UX** - No loading spinners for every action  
✅ **Reduced Server Load** - Fewer requests to handle  
✅ **Easy State Management** - Single source of truth  

---

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": {
      "field": "email"
    }
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR` - Invalid request data
- `UNAUTHORIZED` - Missing or invalid token
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource doesn't exist
- `CONFLICT` - Resource already exists
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

---

## Security Best Practices

1. **JWT Tokens** - Store securely in AsyncStorage
2. **HTTPS Only** - All production API calls over HTTPS
3. **Token Refresh** - Implement token refresh mechanism
4. **Encryption** - AES-256-GCM for sensitive data
5. **Input Validation** - Validate all inputs client-side
6. **Rate Limiting** - Respect API rate limits
7. **Secure File Upload** - Validate file types and sizes

---

## Implementation Checklist

- [ ] Set up AppDataContext with centralized state
- [ ] Implement authentication flow with JWT
- [ ] Create API service layer for all endpoints
- [ ] Add error handling and retry logic
- [ ] Implement offline data caching
- [ ] Set up WebSocket for real-time chat
- [ ] Add file upload with progress tracking
- [ ] Implement token refresh mechanism
- [ ] Add request/response logging for debugging
- [ ] Test all endpoints with error scenarios

---

**Document Version:** 1.0  
**Last Updated:** November 1, 2025  
**Author:** Medics Development Team
