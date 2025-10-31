# 🗺️ Google Maps SDK - Complete Setup Guide

## Part 1: Get Your Google Maps API Key

### Step 1: Create Google Cloud Project

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the **project dropdown** (top left, next to "Google Cloud")
3. Click **"New Project"**
4. Enter project name: `Healthy-Smiles`
5. Click **"Create"**
6. Wait for the project to be created (notification will appear)

### Step 2: Enable Maps SDK

#### For Android:
1. In the Google Cloud Console, use the search bar at the top
2. Type: `Maps SDK for Android`
3. Click on **"Maps SDK for Android"**
4. Click the blue **"Enable"** button
5. Wait for it to enable (takes a few seconds)

#### For iOS (if you plan to build for iOS):
1. Search for: `Maps SDK for iOS`
2. Click on **"Maps SDK for iOS"**
3. Click **"Enable"**

### Step 3: Create API Key

1. In the left sidebar, click **"Credentials"**
2. Click **"+ Create Credentials"** (at the top)
3. Select **"API Key"**
4. A popup will appear with your API key - **COPY IT!**
5. Example: `AIzaSyBXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx`

### Step 4: Secure Your API Key (IMPORTANT!)

1. After creating the key, click **"Restrict Key"** in the popup
2. Give it a name: `Healthy-Smiles-Maps-Key`

#### Application Restrictions:
1. Select **"Android apps"**
2. Click **"Add an item"**
3. Enter:
   - Package name: `com.purushothaman2212.Medics`
   - SHA-1 certificate fingerprint: (Get this from your terminal - see below)

**To get SHA-1 fingerprint:**
```bash
# For debug builds (development):
cd android
./gradlew signingReport

# Look for the SHA-1 under "Variant: debug"
# Example: SHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

#### API Restrictions:
1. Select **"Restrict key"**
2. Choose **"Maps SDK for Android"**
3. Click **"Save"**

### Step 5: Enable Billing (Required!)

1. In the left sidebar, click **"Billing"**
2. Click **"Link a billing account"**
3. Follow the prompts to add a credit card
4. **Don't worry:** Google gives $200 free credit every month
5. Typical usage for small apps: $0-10/month

---

## Part 2: Configure Your Expo App

### Step 1: Add API Key to app.json

Open `app.json` and replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "AIzaSyBXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "AIzaSyBXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx"
      }
    }
  }
}
```

### Step 2: Generate Native Files

Run this command to generate Android/iOS native files:

```bash
npx expo prebuild --clean
```

This will:
- Create `android/` and `ios/` folders
- Add Google Maps configuration automatically
- Install native dependencies

### Step 3: Build and Run

#### For Android:
```bash
npx expo run:android
```

#### For iOS:
```bash
npx expo run:ios
```

**Note:** After running `prebuild`, you can't use `expo start` with Expo Go anymore. You need to use the development builds.

---

## Part 3: Update Hospital Locations

### Find Real Hospital Coordinates

1. **Using Google Maps:**
   - Go to [Google Maps](https://www.google.com/maps)
   - Search for a hospital (e.g., "City General Hospital, Your City")
   - Right-click on the location
   - Click the coordinates (e.g., `37.7749, -122.4194`)
   - Copy them

2. **Update FindHospitals.tsx:**

Open `app/Pages/Hospitals/FindHospitals.tsx` and update:

```typescript
const TOP_RATED_HOSPITALS: Hospital[] = [
  {
    id: '1',
    name: 'City General Hospital',
    speciality: 'Multi-Speciality',
    rating: 4.7,
    distance: '100m',
    latitude: 37.7749,    // Replace with your hospital's latitude
    longitude: -122.4194,  // Replace with your hospital's longitude
  },
  {
    id: '2',
    name: 'Mercy Medical Hospital',
    speciality: 'Cardiology',
    rating: 4.7,
    distance: '501m away',
    latitude: 37.7895,    // Replace with your hospital's latitude
    longitude: -122.4310,  // Replace with your hospital's longitude
  },
  // Add more hospitals...
];
```

3. **Update Initial Map Region:**

Change the default location to your area:

```typescript
const initialRegion = {
  latitude: 37.7749,     // Your city's latitude
  longitude: -122.4194,   // Your city's longitude
  latitudeDelta: 0.02,    // Zoom level (smaller = more zoomed in)
  longitudeDelta: 0.02,
};
```

---

## Part 4: Test Your Implementation

### Test Checklist:

1. **Map Loads** ✓
   - You should see a Google Map (not a gray screen)
   - Map should be centered on your location

2. **Hospital Markers** ✓
   - Green circular markers with medical icons
   - Positioned at hospital locations

3. **Tap Markers** ✓
   - Tapping a marker shows hospital name and specialty
   - Bottom sheet or callout appears

4. **User Location** ✓
   - Blue dot shows your current location
   - "My Location" button works

5. **Map Controls** ✓
   - Can zoom in/out with pinch gesture
   - Can pan around the map
   - Compass shows when map is rotated

---

## Part 5: Request Location Permissions

To show user's location, you need to request permissions:

### Update FindHospitals.tsx:

Add this import at the top:

```typescript
import * as Location from 'expo-location';
import { useEffect } from 'react';
```

Add this code inside your component:

```typescript
export default function FindHospitals() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      // Request permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required to show nearby hospitals');
        return;
      }

      // Get current location
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  // Rest of your code...
}
```

### Update app.json Permissions:

Add location permissions:

```json
{
  "expo": {
    "android": {
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    },
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "This app needs location access to show nearby hospitals"
      }
    }
  }
}
```

---

## Part 6: Troubleshooting

### Problem: Gray Screen / Map Not Loading

**Solution:**
1. Check if API key is correct in `app.json`
2. Verify billing is enabled on Google Cloud
3. Make sure Maps SDK for Android is enabled
4. Run `npx expo prebuild --clean` again
5. Rebuild: `npx expo run:android`

### Problem: Markers Not Showing

**Solution:**
1. Check if coordinates are valid (latitude: -90 to 90, longitude: -180 to 180)
2. Verify coordinates are within the visible map region
3. Check console for errors: `npx react-native log-android`

### Problem: "Google Play Services Not Available"

**Solution:**
1. This happens on emulators without Google Play
2. Use a device with Google Play Services
3. Or use an emulator with Google Play (Pixel devices in Android Studio)

### Problem: App Crashes After Adding Maps

**Solution:**
1. Clean build:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx expo run:android
   ```

### Problem: "API Key Restricted" Error

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Edit your API key
3. Under Application Restrictions, add your package name: `com.purushothaman2212.Medics`
4. Under API Restrictions, ensure "Maps SDK for Android" is selected
5. Add your SHA-1 fingerprint (get it from `cd android && ./gradlew signingReport`)

---

## Part 7: Advanced Features

### Calculate Distance Between User and Hospital

```typescript
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`;
};
```

### Add Route/Directions to Hospital

```typescript
import { Linking } from 'react-native';

const openGoogleMapsDirections = (lat: number, lng: number, name: string) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${name}`;
  Linking.openURL(url);
};

// Use it in your Detail button:
<TouchableOpacity 
  style={styles.detailButton}
  onPress={() => openGoogleMapsDirections(hospital.latitude, hospital.longitude, hospital.name)}
>
  <Text style={styles.detailButtonText}>Get Directions</Text>
</TouchableOpacity>
```

### Custom Marker Design

```typescript
<Marker
  coordinate={{ latitude: hospital.latitude, longitude: hospital.longitude }}
  title={hospital.name}
  description={hospital.speciality}
>
  <View style={styles.customMarker}>
    <Ionicons name="medical" size={24} color="#FFFFFF" />
    <Text style={styles.markerText}>{hospital.rating}⭐</Text>
  </View>
</Marker>
```

---

## 📋 Quick Reference Commands

```bash
# Install maps package
npx expo install react-native-maps

# Generate native code
npx expo prebuild --clean

# Build for Android
npx expo run:android

# Build for iOS
npx expo run:ios

# View Android logs
npx react-native log-android

# Clean Android build
cd android && ./gradlew clean && cd ..
```

---

## ✅ Final Checklist

- [ ] Created Google Cloud project
- [ ] Enabled Maps SDK for Android
- [ ] Created and copied API key
- [ ] Added API key to `app.json`
- [ ] Enabled billing on Google Cloud
- [ ] Ran `npx expo prebuild --clean`
- [ ] Updated hospital coordinates
- [ ] Built app with `npx expo run:android`
- [ ] Map loads successfully
- [ ] Hospital markers appear
- [ ] User location shows (blue dot)

---

## 📞 Need Help?

- Google Maps Platform Docs: https://developers.google.com/maps/documentation
- React Native Maps: https://github.com/react-native-maps/react-native-maps
- Expo Maps: https://docs.expo.dev/versions/latest/sdk/map-view/

**Your map is now ready! 🎉🗺️**
