# Google Maps Setup Guide

## 🗺️ Setting up Google Maps for Your App

### Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps SDK for Android**
   - **Maps SDK for iOS** (if building for iOS)
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key

### Step 2: Configure Android

1. Open `android/app/src/main/AndroidManifest.xml`
2. Add this inside the `<application>` tag:

```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_GOOGLE_MAPS_API_KEY_HERE"/>
```

### Step 3: Configure iOS (if needed)

1. Open `ios/Podfile`
2. Add this line inside the target block:

```ruby
pod 'GoogleMaps'
```

3. Run `cd ios && pod install`
4. Open `ios/YourAppName/AppDelegate.mm`
5. Add at the top:

```objc
#import <GoogleMaps/GoogleMaps.h>
```

6. Add this in `didFinishLaunchingWithOptions`:

```objc
[GMSServices provideAPIKey:@"YOUR_GOOGLE_MAPS_API_KEY_HERE"];
```

### Step 4: Update app.json (Expo Config)

Add this to your `app.json`:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY_HERE"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY_HERE"
      }
    }
  }
}
```

### Step 5: Test Your Implementation

1. Rebuild your app:
   ```bash
   npx expo prebuild --clean
   npx expo run:android
   # or
   npx expo run:ios
   ```

2. The map should now display with hospital markers!

## 📍 Customizing Hospital Locations

Update the coordinates in `FindHospitals.tsx` to match your actual hospital locations:

```typescript
const TOP_RATED_HOSPITALS: Hospital[] = [
  {
    id: '1',
    name: 'City General Hospital',
    speciality: 'Multi-Speciality',
    rating: 4.7,
    distance: '100m',
    latitude: YOUR_LATITUDE,  // Update this
    longitude: YOUR_LONGITUDE, // Update this
  },
  // ... more hospitals
];
```

## 🎨 Features Implemented

- ✅ Interactive Google Maps
- ✅ Custom hospital markers (green medical icons)
- ✅ User location display
- ✅ Tap markers to see hospital info
- ✅ My Location button
- ✅ Compass for orientation
- ✅ Smooth scrolling list below map

## 📱 Getting User's Current Location

To center the map on the user's location, you can use:

```typescript
import * as Location from 'expo-location';

// Add this in useEffect
useEffect(() => {
  (async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required');
      return;
    }
    
    let location = await Location.getCurrentPositionAsync({});
    // Update map region to user's location
  })();
}, []);
```

## 🔧 Troubleshooting

**Map shows gray screen:**
- Check if API key is correctly configured
- Ensure billing is enabled on Google Cloud Console
- Verify that Maps SDK for Android/iOS is enabled

**Markers not showing:**
- Check console for errors
- Verify latitude/longitude values are correct
- Ensure coordinates are within visible map bounds

**App crashes on Android:**
- Run `npx expo prebuild --clean`
- Rebuild the app with `npx expo run:android`

---

Need help? Check [React Native Maps Documentation](https://github.com/react-native-maps/react-native-maps)
