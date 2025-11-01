# 🏥 Medics - Healthcare Mobile Application# Welcome to your Expo app 👋



<div align="center">This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).



![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)## Get started

![React Native](https://img.shields.io/badge/React%20Native-0.81.4-61DAFB.svg)

![Expo](https://img.shields.io/badge/Expo-~54.0.10-000020.svg)1. Install dependencies

![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6.svg)

   ```bash

A comprehensive healthcare mobile application built with React Native and Expo, providing seamless access to medical services, doctor consultations, pharmacy, and health management.   npm install

   ```

</div>

2. Start the app

---

   ```bash

## 📋 Table of Contents   npx expo start

   ```

- [Features](#-features)

- [Tech Stack](#-tech-stack)In the output, you'll find options to open the app in a

- [Architecture](#-architecture)

- [Getting Started](#-getting-started)- [development build](https://docs.expo.dev/develop/development-builds/introduction/)

- [Project Structure](#-project-structure)- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)

- [Key Features Details](#-key-features-details)- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)

- [Navigation Flow](#-navigation-flow)- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

- [Backend Integration](#-backend-integration)

- [Configuration](#-configuration)You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

- [Scripts](#-scripts)

## Get a fresh project

---

When you're ready, run:

## ✨ Features

```bash

### 🔐 Authentication & Securitynpm run reset-project

- **User Registration & Login** - Secure authentication for patients```

- **Forgot Password Flow** - 4-step password recovery (Email → Code Verification → New Password → Success)

- **Biometric Authentication** - Support for fingerprint/face ID via expo-local-authenticationThis command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

- **Secure Data Storage** - AsyncStorage for persistent user data

## Learn more

### 🏠 Home & Dashboard

- **Personalized Dashboard** - Welcome screen with user profileTo learn more about developing your project with Expo, look at the following resources:

- **Quick Search** - Search for doctors, hospitals, and medicines

- **Category Navigation** - Quick access to Pharmacy, Doctors, Hospitals, and Appointments- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).

- **Top Doctors** - Curated list of highly-rated doctors- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

- **Health Articles** - Expandable health tips and educational content

- **Medical Insurance** - Dedicated insurance information page with YouTube video integration## Join the community

- **Early Health Protection Banner** - Interactive banner with "Learn more" redirect

Join our community of developers creating universal apps.

### 👨‍⚕️ Doctor Services

- **Find Doctors** - Browse doctors by specialty (General, Lungs, Dentist, Psychiatrist, Covid-19, Surgeon, Cardiologist)- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.

- **Doctor Profiles** - Detailed doctor information with ratings, experience, and distance- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

- **Doctor Search** - Real-time search across all specialties
- **Appointment Booking** - Schedule appointments with preferred date/time
- **Consultation Reasons** - Select from 15+ common medical reasons
- **Top Doctors List** - Featured doctors on home screen

### 🏥 Hospital Services
- **Hospital Finder** - Interactive map view with Google Maps integration
- **Location-based Search** - Find nearby hospitals with distance calculation
- **Hospital Details** - Comprehensive hospital information with ratings
- **Appointment Scheduling** - Book hospital visits with date/time selection
- **Multi-Specialty Support** - Browse hospitals by specialization

### 💊 Pharmacy
- **Medicine Search** - Search across all available medications
- **Product Catalog** - Browse medicines with images, prices, and ratings
- **Sale Products** - Auto-scrolling carousel of discounted items
- **Popular Products** - Quick access to frequently purchased items
- **Drug Details** - Detailed medicine information with descriptions
- **Shopping Cart** - Add/remove items with quantity management
- **Price Comparison** - Original vs. sale price display

### 💬 Chat & Messaging
- **Doctor Chat** - Direct messaging with healthcare providers
- **Chat History** - View all previous conversations
- **Real-time Messaging** - Send/receive messages with timestamps
- **Unread Indicators** - Visual badges for new messages
- **Doctor Ratings** - See doctor ratings in chat list

### 👤 Profile & Settings
- **User Profile Management** - View and edit personal information
- **Profile Picture** - Upload/update profile photo with image cropping
- **Health Stats** - Track height and weight
- **Medical Files** - Upload and manage medical documents (PDF, images)
- **File Preview** - View uploaded documents with expo-sharing
- **Payment History** - Track all medical payments with tabs (Upcoming/Completed)
- **FAQs** - Accordion-style frequently asked questions
- **Logout** - Secure logout with confirmation

### 🔔 Notifications
- **Notification Center** - Centralized view of all notifications
- **Categorized Notifications** - "New" and "Earlier" sections
- **Unread Indicators** - Visual markers for new notifications
- **Global Access** - Accessible from all screens via bell icon
- **Notification Types** - Appointments, promotions, health tips, reminders

### 🎨 UI/UX Features
- **Modern Design** - Clean, professional medical interface
- **Glassmorphism Effects** - Frosted glass UI elements
- **Bottom Navigation** - Easy access to Home, Chat, Profile
- **Custom App Header** - Consistent header across all screens
- **Smooth Animations** - LayoutAnimation for accordions and transitions
- **Responsive Design** - Adapts to different screen sizes
- **Status Bar Management** - Proper status bar styling throughout
- **Loading States** - Activity indicators for async operations

---

## 🛠 Tech Stack

### Core Framework
- **React Native** 0.81.4 - Mobile app framework
- **Expo** ~54.0.10 - Development platform
- **TypeScript** - Type-safe development
- **React** 19.1.0 - UI library

### Navigation
- **@react-navigation/native** ^7.1.8 - Navigation container
- **@react-navigation/stack** ^7.4.8 - Stack navigator
- **@react-navigation/bottom-tabs** ^7.4.0 - Bottom tab navigation

### State Management & Storage
- **@react-native-async-storage/async-storage** ^2.2.0 - Persistent storage
- **Zustand** (via cart stores) - Shopping cart state management

### UI Components & Icons
- **@expo/vector-icons** ^15.0.2 - Icon library (Ionicons, Feather, MaterialCommunityIcons)
- **expo-linear-gradient** ~15.0.7 - Gradient backgrounds
- **expo-blur** ~15.0.7 - Blur effects
- **@animatereactnative/marquee** ^0.5.2 - Scrolling text animations

### Media & File Handling
- **expo-image-picker** ^17.0.8 - Photo selection from gallery/camera
- **expo-image-manipulator** ^14.0.7 - Image cropping and resizing
- **expo-document-picker** ^14.0.7 - File selection (PDF, documents)
- **expo-sharing** ~14.0.7 - Share files with other apps
- **react-native-webview** - YouTube video embedding

### Maps & Location
- **react-native-maps** 1.20.1 - Google Maps integration
- **expo-location** (via maps) - Location services

### Security & Authentication
- **expo-local-authentication** ^17.0.7 - Biometric authentication
- **Backend Integration** - Secure login/register with JWT tokens

### Other Utilities
- **expo-constants** ~18.0.9 - Environment variables
- **expo-linking** ~8.0.8 - Deep linking support
- **expo-haptics** ~15.0.7 - Tactile feedback
- **expo-status-bar** ~3.0.8 - Status bar management
- **react-native-gesture-handler** ~2.28.0 - Gesture handling
- **react-native-reanimated** ~4.1.1 - Advanced animations
- **react-native-safe-area-context** ~5.6.0 - Safe area handling

---

## 🏗 Architecture

### Design Pattern
- **Component-Based Architecture** - Reusable, modular components
- **Screen-Component Separation** - Clear separation between screens and UI components
- **Type-Safe Navigation** - TypeScript navigation types for all routes
- **Wrapper Pattern** - ScreenWrapper for conditional bottom navigation

### Key Architectural Components

#### 1. Navigation System
```
RootStackParamList (types.ts)
    ├── Auth Screens (no bottom nav)
    │   ├── Intro
    │   ├── Login
    │   ├── SignUp
    │   └── ForgotPassword
    └── App Screens (with bottom nav)
        ├── Home (tab)
        ├── Chat (tab)
        ├── Profile (tab)
        └── Feature Screens (inherit parent tab)
```

#### 2. Component Hierarchy
```
App
├── ScreenWrapper
│   ├── Screen Content
│   └── BottomNavigation (conditional)
├── AppHeader (reusable)
└── Feature-specific components
```

#### 3. Data Flow
```
User Input → Component State → AsyncStorage/API
                              ↓
                        Update UI ← Response
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Expo Go app (for physical device testing)

### Installation

1. **Clone the repository**
```bash
cd Medics
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
- Update `app.json` with your Google Maps API key
- Configure backend URL in `expo-constants` if using custom backend

4. **Start the development server**
```bash
npm start
# or
expo start
```

5. **Run on device/emulator**
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

---

## 📁 Project Structure

```
Medics/
├── app/                          # Main application code
│   ├── (tabs)/                   # Tab-based screens
│   │   └── _layout.tsx          # Navigation configuration
│   ├── components/               # Reusable components
│   │   ├── AppHeader.tsx        # Standard header component
│   │   ├── BottomNavigation.tsx # Bottom tab navigation
│   │   ├── ScreenWrapper.tsx    # Wrapper for bottom nav logic
│   │   ├── AuthOptions.tsx      # Auth screen options
│   │   └── JuicyTransitionWrapper.tsx
│   ├── Home/                     # Home screen features
│   │   ├── Home.tsx             # Main home screen
│   │   ├── Insurance.tsx        # Medical insurance info
│   │   └── types/               # Type definitions
│   ├── Login/                    # Authentication screens
│   │   ├── Login.tsx            # Login screen
│   │   ├── Signup.tsx           # Registration screen
│   │   └── ForgotPassword.tsx   # Password recovery
│   ├── Pages/                    # Feature screens
│   │   ├── articles.tsx         # Health articles
│   │   ├── Chat/                # Messaging features
│   │   │   ├── AllChatsScreen.tsx
│   │   │   └── IndividualChatScreen.tsx
│   │   ├── Doctors/             # Doctor-related screens
│   │   │   ├── FindDoctors.tsx  # Doctor search
│   │   │   ├── DoctorDetails.tsx
│   │   │   ├── Appointment.tsx  # Booking screen
│   │   │   └── Topdoctor.tsx
│   │   ├── Hospitals/           # Hospital features
│   │   │   ├── FindHospitals.tsx # Map view
│   │   │   ├── HospitalDetails.tsx
│   │   │   └── AppointmentsScheduleScreen.tsx
│   │   ├── Pharmacy/            # Pharmacy features
│   │   │   ├── PharmacyScreen.tsx
│   │   │   ├── DrugDetailScreen.tsx
│   │   │   ├── CartScreen.tsx
│   │   │   └── stores/          # Cart state management
│   │   │       └── cartStores.ts
│   │   ├── Profile/             # User profile screens
│   │   │   ├── Profile.tsx      # Main profile
│   │   │   ├── EditProfile.tsx  # Edit profile
│   │   │   ├── MedicalFiles.tsx # File management
│   │   │   ├── PaymentHistory.tsx
│   │   │   └── FAQScreen.tsx
│   │   └── styles/              # Screen-specific styles
│   │       ├── homeStyles.ts
│   │       ├── appointmentStyles.ts
│   │       ├── articlesStyles.ts
│   │       └── ...
│   ├── Navigation/               # Navigation types
│   │   └── types.ts             # TypeScript route definitions
│   ├── InviteScreen.tsx         # Onboarding screen
│   └── Notifications.tsx        # Notification center
├── assets/                       # Static assets
│   ├── animation/               # Animation files
│   ├── doctors/                 # Doctor images
│   └── images/                  # App images
├── components/                   # Global components
│   └── ui/
│       └── logo-animation.tsx
├── constants/                    # App constants
│   └── theme.ts
├── hooks/                        # Custom hooks
│   ├── use-color-scheme.ts
│   └── use-theme-color.ts
├── app.json                      # Expo configuration
├── package.json                  # Dependencies
├── tsconfig.json                # TypeScript config
└── README.md                    # This file
```

---

## 🎯 Key Features Details

### Authentication Flow

#### Login Process
1. User enters email and password
2. Validation check (empty fields)
3. API call to backend `/login` endpoint
4. Store JWT token in AsyncStorage
5. Navigate to Home screen

#### Forgot Password Flow
1. **Step 1 - Email**: User enters email
2. **Step 2 - Verification**: Enter 4-digit code (masked display)
3. **Step 3 - Reset**: Create new password with confirmation
4. **Step 4 - Success**: Modal confirmation, navigate to login

### Doctor Booking System

#### Find Doctors
- **7 Specialty Categories**: General, Lungs Specialist, Dentist, Psychiatrist, Covid-19, Surgeon, Cardiologist
- **Dynamic Filtering**: Switch categories to see relevant doctors
- **Search Functionality**: Real-time search across all doctors
- **Doctor Cards**: Display name, specialty, rating, distance, experience

#### Appointment Flow
1. Select doctor from list
2. View doctor details
3. Choose appointment date
4. Select time slot
5. Pick consultation reason (15+ options)
6. Confirm booking
7. Success confirmation modal

### Pharmacy Features

#### Product Management
- **Auto-scrolling Sale Carousel**: 3-second interval for sale items
- **Category Sections**: Sale, Popular, Featured products
- **Smart Search**: Filter by name or description
- **Product Details**: Full-screen view with description, rating, price

#### Shopping Cart
- **Zustand State Management**: Global cart state
- **Add/Remove Items**: Simple cart operations
- **Quantity Control**: Increment/decrement quantities
- **Total Calculation**: Real-time price updates
- **Badge Counter**: Cart items count on icon

### Hospital Services

#### Interactive Map
- **Google Maps Integration**: Native map component
- **Hospital Markers**: Visual indicators on map
- **Custom Styling**: Medical-themed map design
- **Distance Calculation**: From user location

#### Hospital Cards
- **Top Rated List**: Best hospitals sorted by rating
- **Detailed Information**: Name, specialty, rating, distance
- **Easy Navigation**: Tap to view details or get directions

### Profile Management

#### Edit Profile
- **Photo Upload**: Camera or gallery selection
- **Image Cropping**: 1:1 aspect ratio for profile pictures
- **Data Fields**: Name, email, phone, height, weight
- **AsyncStorage Persistence**: Save changes locally
- **Validation**: Input validation before save

#### Medical Files
- **File Upload**: PDF and image support (PNG, JPG, JPEG)
- **File List**: All uploaded documents
- **Preview**: Open files with native viewer
- **File Management**: Upload and view medical records

#### Payment History
- **Tab Navigation**: Upcoming vs Completed payments
- **Payment Cards**: Date, time, doctor, status
- **Status Badges**: Visual indicators (Upcoming/Completed)
- **Amount Display**: Clear pricing information

### Notifications System

#### Global Access
- Accessible from all screens via bell icon in AppHeader
- Automatic tab highlighting (returns to Home tab)

#### Notification Types
1. **Appointments**: Appointment confirmations and reminders
2. **Promotions**: Pharmacy deals and health offers
3. **Health Tips**: Daily health advice and articles
4. **Reminders**: Medication and checkup reminders

#### Display
- **Sections**: "New" (unread) and "Earlier" (read)
- **Cards**: Icon, title, message, timestamp
- **Unread Indicators**: Green dot for new notifications

### Medical Insurance

#### Features
- **YouTube Video**: Embedded health insurance explainer
- **Glassmorphic Play Button**: Modern frosted glass design
- **Key Benefits**: 4 main insurance benefits with checkmarks
- **Supported Providers**: Horizontal scroll of insurance companies (Max Bupa, Star Health, HDFC ERGO, Care Health)
- **Deep Linking**: Opens YouTube app when tapped

---

## 🧭 Navigation Flow

### Tab Navigation Structure
```
Bottom Tabs
├── Home Tab
│   ├── Home Screen
│   ├── Insurance Screen
│   ├── Articles Screen
│   ├── Notifications Screen ✓
│   └── Feature Screens
├── Chat Tab
│   ├── All Chats Screen
│   └── Individual Chat Screen
└── Profile Tab
    ├── Profile Screen
    ├── Edit Profile Screen
    ├── Medical Files Screen
    ├── Payment History Screen
    └── FAQs Screen
```

### Screen Relationships
- **Notifications** → Returns to Home tab (special mapping)
- **Payment History** → Returns to Profile tab
- **FAQs** → Returns to Profile tab
- **Doctor Details** → Inherits from parent tab
- **Hospital Details** → Inherits from parent tab

### Navigation Props
All screens use type-safe navigation:
```typescript
type NavigationProp = StackNavigationProp<RootStackParamList>;
const navigation = useNavigation<NavigationProp>();
```

---

## 🔌 Backend Integration

### API Endpoints

#### Authentication
- **POST** `/login` - User login
  - Body: `{ role, email, password }`
  - Response: `{ token, user }`

- **POST** `/register` - User registration
  - Body: `{ role, name, email, password, phone }`
  - Response: `{ token, user }`

### Backend Setup
The backend is located in `../Backend/` directory and uses:
- **Express.js** - Node.js web framework
- **PostgreSQL** - Database
- **AES-256-GCM** - File encryption
- **JWT** - Authentication tokens

See `../Backend/README.md` for full backend documentation.

---

## ⚙️ Configuration

### Google Maps API
Update your Google Maps API key in `app.json`:
```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_IOS_API_KEY"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ANDROID_API_KEY"
        }
      }
    }
  }
}
```

### Backend URL
Configure in `expo-constants` extra config or directly in Login.tsx:
```typescript
const backend = Constants.expoConfig?.extra?.BACKEND_URL || 'http://localhost:4000';
```

### Color Theme
Main colors defined throughout the app:
- **Primary Green**: `#3CB179` / `#34D399`
- **Text Primary**: `#1F2937`
- **Text Secondary**: `#6B7280`
- **Background**: `#F3F4F6`
- **Border**: `#E5E7EB`

---

## 📜 Scripts

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web browser
npm run web

# Lint code
npm run lint

# Reset project (clean cache)
npm run reset-project
```

---

## 🎨 Design Patterns Used

### Component Patterns
1. **Higher-Order Components**: `withBottomNav`, `withoutBottomNav`
2. **Render Props**: Used in navigation wrappers
3. **Custom Hooks**: `useNavigation`, `useRoute`, `useCartStore`
4. **Presentational/Container**: Separation of UI and logic

### State Management Patterns
1. **Local State**: `useState` for component-specific state
2. **Persistent State**: AsyncStorage for user data
3. **Global State**: Zustand for shopping cart
4. **Navigation State**: React Navigation for screen state

### Code Organization
1. **Feature-Based Structure**: Grouped by feature (Doctors, Pharmacy, etc.)
2. **Shared Components**: Reusable UI components in `/components`
3. **Type Safety**: TypeScript interfaces and types
4. **Style Separation**: Dedicated style files per feature

---

## 🔒 Security Features

1. **Secure Authentication**: JWT tokens stored in AsyncStorage
2. **Biometric Support**: Fingerprint/Face ID via expo-local-authentication
3. **Input Validation**: Client-side validation for all forms
4. **Encrypted Backend**: AES-256-GCM encryption for sensitive files
5. **Secure Storage**: AsyncStorage for persistent data

---

## 📱 Supported Platforms

- ✅ iOS (iPhone/iPad)
- ✅ Android (Phone/Tablet)
- ✅ Web (Progressive Web App)

### Platform-Specific Features
- **iOS**: Native biometric authentication, smooth animations
- **Android**: Material Design components, back gesture handling
- **Web**: Responsive design, static output

---

## 🐛 Known Issues & Limitations

1. **LayoutAnimation Warning**: New Architecture shows warning for `setLayoutAnimationEnabledExperimental` (handled with feature detection)
2. **YouTube Integration**: Opens in external browser for better compatibility
3. **Google Maps**: Requires API key configuration
4. **Backend Dependency**: App requires backend server for authentication

---

## 📊 App Statistics

- **Total Screens**: 25+
- **Reusable Components**: 10+
- **API Endpoints**: 5+
- **Doctor Specialties**: 7 categories
- **Lines of Code**: 10,000+
- **Dependencies**: 50+
- **Supported Insurance Providers**: 4 major companies

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Video consultations with doctors
- [ ] Prescription management
- [ ] Medicine delivery tracking
- [ ] Health records integration
- [ ] Wearable device sync
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Push notifications
- [ ] In-app payments
- [ ] Telemedicine features

---

## 📄 License

This project is part of the Healthy Smiles healthcare platform.

---

<div align="center">

**Built with ❤️ using React Native & Expo**

Made by Purushothaman | 2025

</div>
