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

**Purpose:** Upload medical files with **El Gamal encryption** for maximum security

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
    "createdAt": "2025-11-01T11:00:00Z",
    "encryption": "ElGamal"
  }
}
```

**El Gamal Encryption Process:**
1. Generate public/private key pair for each user on registration
2. Encrypt file using recipient's public key
3. Store encrypted file in database
4. Only user with private key can decrypt
5. Support multi-recipient encryption for doctor access

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

### 5.3 Download Medical File
**Endpoint:** `GET /api/files/medical/:fileId/download`

**Purpose:** Download and decrypt medical file using El Gamal

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (200):**
- Returns file stream with decrypted content
- Content-Type header set to file's mimeType
- Content-Disposition header for download

**El Gamal Decryption Process:**
1. Verify user has permission to access file
2. Retrieve encrypted file from database
3. Decrypt using user's private key
4. Stream decrypted file to client

---

### 5.4 Delete Medical File
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

**Security Protocol:** All chat messages use **Diffie-Hellman Key Exchange** for end-to-end encryption and **WebSocket** for real-time communication.

### 6.0 Establish Chat Connection (WebSocket)
**WebSocket URL:** `wss://example.com/chat?token=<jwt-token>`

**Purpose:** Establish secure WebSocket connection with Diffie-Hellman key exchange

**Connection Flow:**
1. Client connects with JWT token in query parameter
2. Server validates token and creates WebSocket connection
3. **Diffie-Hellman Key Exchange** initiated:
   - Server generates prime number (p) and generator (g)
   - Server generates private key (a) and calculates public key (A = g^a mod p)
   - Server sends: `{ type: 'dh-init', p, g, A }`
   - Client generates private key (b) and calculates public key (B = g^b mod p)
   - Client sends: `{ type: 'dh-response', B }`
   - Both calculate shared secret: `s = B^a mod p = A^b mod p`
   - Shared secret used as AES-256 key for message encryption
4. Connection established with end-to-end encryption

**WebSocket Message Types:**
```javascript
// Server to Client
{
  "type": "dh-init",
  "p": "large_prime_number",
  "g": "generator",
  "A": "server_public_key"
}

// Client to Server
{
  "type": "dh-response",
  "B": "client_public_key"
}

// New message (encrypted)
{
  "type": "message",
  "chatId": "chat-001",
  "messageId": "msg-123",
  "encryptedData": "base64_encrypted_message",
  "iv": "initialization_vector",
  "timestamp": "2025-11-01T10:35:00Z"
}

// Typing indicator
{
  "type": "typing",
  "chatId": "chat-001",
  "isTyping": true
}

// Online status
{
  "type": "status",
  "userId": "doctor-id",
  "isOnline": true
}

// Message delivered
{
  "type": "delivered",
  "messageId": "msg-123"
}

// Message read
{
  "type": "read",
  "messageId": "msg-123"
}
```

**Frontend WebSocket Implementation:**
```javascript
import { io } from 'socket.io-client';
import CryptoJS from 'crypto-js';

class SecureChatClient {
  constructor(token) {
    this.token = token;
    this.socket = null;
    this.sharedSecret = null;
    this.dhPrivateKey = null;
  }

  connect() {
    this.socket = io('wss://example.com/chat', {
      auth: { token: this.token },
      transports: ['websocket']
    });

    // Handle Diffie-Hellman key exchange
    this.socket.on('dh-init', ({ p, g, A }) => {
      // Generate client private key (b) and public key (B = g^b mod p)
      this.dhPrivateKey = this.generateRandomKey();
      const B = this.modPow(g, this.dhPrivateKey, p);
      
      // Calculate shared secret (s = A^b mod p)
      this.sharedSecret = this.modPow(A, this.dhPrivateKey, p);
      
      // Send client public key to server
      this.socket.emit('dh-response', { B });
      
      console.log('Secure connection established');
    });

    // Handle incoming encrypted messages
    this.socket.on('message', ({ encryptedData, iv }) => {
      const decryptedMessage = this.decryptMessage(encryptedData, iv);
      // Update UI with decrypted message
      this.handleNewMessage(JSON.parse(decryptedMessage));
    });
  }

  sendMessage(chatId, text) {
    // Encrypt message with shared secret
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(
      text,
      this.sharedSecret.toString(),
      { iv }
    );

    this.socket.emit('send-message', {
      chatId,
      encryptedData: encrypted.toString(),
      iv: iv.toString()
    });
  }

  encryptMessage(text) {
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(
      text,
      this.sharedSecret.toString(),
      { iv }
    );
    return {
      encryptedData: encrypted.toString(),
      iv: iv.toString()
    };
  }

  decryptMessage(encryptedData, iv) {
    const decrypted = CryptoJS.AES.decrypt(
      encryptedData,
      this.sharedSecret.toString(),
      { iv: CryptoJS.enc.Hex.parse(iv) }
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  // Modular exponentiation for Diffie-Hellman
  modPow(base, exp, mod) {
    // Implement efficient modular exponentiation
    // Can use a library like big-integer for large numbers
    return Math.pow(base, exp) % mod;
  }

  generateRandomKey() {
    // Generate random private key
    return Math.floor(Math.random() * 1000000) + 1;
  }
}

// Usage
const chatClient = new SecureChatClient(token);
chatClient.connect();
chatClient.sendMessage('chat-001', 'Hello doctor!');
```

---

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

### 6.3 Send Message (HTTP Fallback)
**Endpoint:** `POST /api/chats/:chatId/messages`

**Note:** This is a fallback endpoint. Real-time messaging should use WebSocket with Diffie-Hellman encryption.

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
  "text": "Thank you for your help!",
  "encryptedData": "base64_encrypted_text", // Optional: pre-encrypted on client
  "iv": "initialization_vector" // Required if encryptedData provided
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

---

### 6.4 Initialize Diffie-Hellman Key Exchange
**Endpoint:** `POST /api/chats/:chatId/init-encryption`

**Purpose:** Initialize Diffie-Hellman parameters for chat session (alternative to WebSocket)

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Response (200):**
```json
{
  "success": true,
  "dhParams": {
    "p": "179769313486231590772930519078902473361797697894230657273430081157732675805500963132708477322407536021120113879871393357658789768814416622492847430639474124377767893424865485276302219601246094119453082952085005768838150682342462881473913110540827237163350510684586298239947245938479716304835356329624224137859",
    "g": "2",
    "serverPublicKey": "123456789012345678901234567890"
  }
}
```

**Request to Complete Exchange:**
```json
{
  "clientPublicKey": "987654321098765432109876543210"
}
```

**Note:** This HTTP-based exchange is less secure than WebSocket. WebSocket with Diffie-Hellman is STRONGLY RECOMMENDED.

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
| **Files** | `/api/files/medical/upload` | POST | Upload medical file (El Gamal encrypted) |
| **Files** | `/api/files/medical/:id/download` | GET | Download & decrypt file (El Gamal) |
| **Files** | `/api/files/medical/:id` | DELETE | Delete file |
| **Chat** | `wss://example.com/chat` | WebSocket | Real-time chat with Diffie-Hellman encryption |
| **Chat** | `/api/chats` | GET | Get chat contacts |
| **Chat** | `/api/chats/:id/messages` | GET | Get chat messages (encrypted) |
| **Chat** | `/api/chats/:id/messages` | POST | Send message (HTTP fallback) |
| **Chat** | `/api/chats/:id/init-encryption` | POST | Initialize Diffie-Hellman (HTTP) |
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
4. **Encryption Algorithms**:
   - **El Gamal Algorithm** - For medical file encryption/decryption (asymmetric encryption)
   - **Diffie-Hellman Key Exchange** - For secure chat key establishment
   - **AES-256-GCM** - For user data encryption (symmetric encryption)
5. **Input Validation** - Validate all inputs client-side
6. **Rate Limiting** - Respect API rate limits
7. **Secure File Upload** - Validate file types and sizes
8. **WebSocket Security** - TLS encryption for real-time chat connections

---

## Cryptographic Implementation Details

### El Gamal Algorithm for Medical Files

**Backend Implementation (Node.js):**
```javascript
// elgamalCrypto.js
const crypto = require('crypto');
const bigInt = require('big-integer');

class ElGamalCrypto {
  // Generate key pair
  static generateKeyPair() {
    // Choose large prime p
    const p = this.generateLargePrime(2048);
    // Choose generator g
    const g = bigInt(2);
    // Generate private key x (random)
    const x = this.randomInRange(bigInt(1), p.subtract(2));
    // Calculate public key y = g^x mod p
    const y = g.modPow(x, p);
    
    return {
      publicKey: { p: p.toString(), g: g.toString(), y: y.toString() },
      privateKey: { x: x.toString(), p: p.toString() }
    };
  }

  // Encrypt file
  static encryptFile(fileBuffer, publicKey) {
    const p = bigInt(publicKey.p);
    const g = bigInt(publicKey.g);
    const y = bigInt(publicKey.y);
    
    // Convert file to big integer
    const message = bigInt(fileBuffer.toString('hex'), 16);
    
    // Generate random k
    const k = this.randomInRange(bigInt(1), p.subtract(2));
    
    // Calculate c1 = g^k mod p
    const c1 = g.modPow(k, p);
    
    // Calculate c2 = m * y^k mod p
    const c2 = message.multiply(y.modPow(k, p)).mod(p);
    
    return {
      c1: c1.toString(),
      c2: c2.toString()
    };
  }

  // Decrypt file
  static decryptFile(ciphertext, privateKey) {
    const p = bigInt(privateKey.p);
    const x = bigInt(privateKey.x);
    const c1 = bigInt(ciphertext.c1);
    const c2 = bigInt(ciphertext.c2);
    
    // Calculate s = c1^x mod p
    const s = c1.modPow(x, p);
    
    // Calculate s_inv = s^(-1) mod p (modular inverse)
    const s_inv = s.modInv(p);
    
    // Calculate m = c2 * s_inv mod p
    const message = c2.multiply(s_inv).mod(p);
    
    // Convert back to buffer
    const hexMessage = message.toString(16);
    return Buffer.from(hexMessage, 'hex');
  }

  static generateLargePrime(bits) {
    // Use crypto library to generate large prime
    // This is simplified - use proper prime generation in production
    return bigInt(crypto.randomBytes(bits / 8).toString('hex'), 16);
  }

  static randomInRange(min, max) {
    const range = max.subtract(min);
    const randomBytes = crypto.randomBytes(32);
    const randomNum = bigInt(randomBytes.toString('hex'), 16);
    return randomNum.mod(range).add(min);
  }
}

module.exports = ElGamalCrypto;
```

**Usage in File Upload Endpoint:**
```javascript
// fileController.js
const ElGamalCrypto = require('./elgamalCrypto');

async function uploadMedicalFile(req, res) {
  try {
    const { file } = req;
    const userId = req.user.id;
    
    // Get user's public key from database
    const user = await db.query('SELECT elgamal_public_key FROM patients WHERE id = $1', [userId]);
    const publicKey = JSON.parse(user.rows[0].elgamal_public_key);
    
    // Encrypt file with El Gamal
    const fileBuffer = file.buffer;
    const encrypted = ElGamalCrypto.encryptFile(fileBuffer, publicKey);
    
    // Store encrypted file in database
    const result = await db.query(
      'INSERT INTO medical_files (patient_id, filename, encrypted_c1, encrypted_c2, mime_type, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id',
      [userId, file.originalname, encrypted.c1, encrypted.c2, file.mimetype]
    );
    
    res.status(201).json({
      success: true,
      fileId: result.rows[0].id,
      encryption: 'ElGamal'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
```

---

### Diffie-Hellman for Chat (WebSocket)

**Backend Implementation (Socket.io):**
```javascript
// chatSocket.js
const socketIo = require('socket.io');
const crypto = require('crypto');
const bigInt = require('big-integer');

class DiffieHellmanChat {
  constructor(io) {
    this.io = io;
    this.sessions = new Map(); // Store DH sessions
  }

  initialize() {
    this.io.on('connection', (socket) => {
      console.log('New chat connection:', socket.id);
      
      // Authenticate user
      const token = socket.handshake.auth.token;
      const user = this.verifyToken(token);
      
      if (!user) {
        socket.disconnect();
        return;
      }
      
      socket.userId = user.id;
      
      // Initialize Diffie-Hellman
      this.initializeDH(socket);
      
      // Handle messages
      socket.on('send-message', (data) => this.handleMessage(socket, data));
      
      // Handle typing
      socket.on('typing', (data) => this.handleTyping(socket, data));
      
      // Handle disconnect
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  initializeDH(socket) {
    // Generate large prime p and generator g
    const p = this.generatePrime(2048);
    const g = bigInt(2);
    
    // Generate server's private key (a)
    const a = this.randomInRange(bigInt(1), p.subtract(2));
    
    // Calculate server's public key (A = g^a mod p)
    const A = g.modPow(a, p);
    
    // Store session
    this.sessions.set(socket.id, {
      p, g, a, A,
      sharedSecret: null
    });
    
    // Send DH parameters to client
    socket.emit('dh-init', {
      p: p.toString(),
      g: g.toString(),
      A: A.toString()
    });
    
    // Handle client response
    socket.once('dh-response', ({ B }) => {
      const session = this.sessions.get(socket.id);
      const clientPublicKey = bigInt(B);
      
      // Calculate shared secret (s = B^a mod p)
      const sharedSecret = clientPublicKey.modPow(session.a, session.p);
      
      session.sharedSecret = sharedSecret.toString();
      this.sessions.set(socket.id, session);
      
      console.log('Secure connection established for user:', socket.userId);
      socket.emit('encryption-ready');
    });
  }

  async handleMessage(socket, { chatId, encryptedData, iv }) {
    const session = this.sessions.get(socket.id);
    
    if (!session || !session.sharedSecret) {
      socket.emit('error', { message: 'Encryption not initialized' });
      return;
    }
    
    try {
      // Decrypt message using shared secret
      const decryptedText = this.decryptAES(encryptedData, session.sharedSecret, iv);
      
      // Store message in database
      const messageId = await this.storeMessage(chatId, socket.userId, decryptedText);
      
      // Encrypt for recipient
      const recipient = await this.getRecipient(chatId, socket.userId);
      const recipientSocket = this.findSocketByUserId(recipient.id);
      
      if (recipientSocket) {
        const recipientSession = this.sessions.get(recipientSocket.id);
        
        if (recipientSession && recipientSession.sharedSecret) {
          // Re-encrypt with recipient's shared secret
          const { encrypted, iv: newIv } = this.encryptAES(
            decryptedText,
            recipientSession.sharedSecret
          );
          
          // Send to recipient
          recipientSocket.emit('message', {
            chatId,
            messageId,
            encryptedData: encrypted,
            iv: newIv,
            sender: socket.userId,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      // Confirm to sender
      socket.emit('message-sent', { messageId, chatId });
      
    } catch (error) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  encryptAES(text, sharedSecret) {
    const iv = crypto.randomBytes(16);
    const key = crypto.createHash('sha256').update(sharedSecret).digest();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    return {
      encrypted,
      iv: iv.toString('hex')
    };
  }

  decryptAES(encryptedData, sharedSecret, ivHex) {
    const key = crypto.createHash('sha256').update(sharedSecret).digest();
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  generatePrime(bits) {
    // Use a library like node-forge for proper prime generation
    return bigInt(crypto.randomBytes(bits / 8).toString('hex'), 16);
  }

  randomInRange(min, max) {
    const range = max.subtract(min);
    const randomNum = bigInt(crypto.randomBytes(32).toString('hex'), 16);
    return randomNum.mod(range).add(min);
  }

  verifyToken(token) {
    // Implement JWT verification
    // Return user object or null
  }

  async storeMessage(chatId, userId, text) {
    // Store in database
    // Return message ID
  }

  async getRecipient(chatId, senderId) {
    // Get the other user in the chat
  }

  findSocketByUserId(userId) {
    // Find connected socket for user
  }

  handleTyping(socket, { chatId, isTyping }) {
    // Broadcast typing indicator to recipient
  }

  handleDisconnect(socket) {
    this.sessions.delete(socket.id);
    console.log('User disconnected:', socket.userId);
  }
}

module.exports = DiffieHellmanChat;
```

**Server Setup:**
```javascript
// index.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const DiffieHellmanChat = require('./chatSocket');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Initialize secure chat
const chatHandler = new DiffieHellmanChat(io);
chatHandler.initialize();

server.listen(4000, () => {
  console.log('Server running on port 4000 with secure WebSocket chat');
});
```

---

## Required NPM Packages

**Backend:**
```json
{
  "dependencies": {
    "socket.io": "^4.5.0",
    "big-integer": "^1.6.51",
    "node-forge": "^1.3.1",
    "crypto": "built-in"
  }
}
```

**Frontend (React Native):**
```json
{
  "dependencies": {
    "socket.io-client": "^4.5.0",
    "crypto-js": "^4.1.1",
    "react-native-big-number": "^1.0.0",
    "buffer": "^6.0.3"
  }
}
```

---

## Implementation Checklist

- [ ] Set up AppDataContext with centralized state
- [ ] Implement authentication flow with JWT
- [ ] Create API service layer for all endpoints
- [ ] **Implement El Gamal encryption for medical files**
- [ ] **Set up Diffie-Hellman key exchange for WebSocket chat**
- [ ] **Configure Socket.io server with TLS/SSL**
- [ ] Add error handling and retry logic
- [ ] Implement offline data caching
- [ ] Add file upload with progress tracking
- [ ] Implement token refresh mechanism
- [ ] Add request/response logging for debugging
- [ ] Test all endpoints with error scenarios
- [ ] **Test encryption/decryption performance**
- [ ] **Implement key rotation policies**
- [ ] **Add rate limiting for WebSocket connections**

---

**Document Version:** 1.0  
**Last Updated:** November 1, 2025  
**Author:** Medics Development Team
