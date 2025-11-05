import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';

/**
 * Force get push token with detailed logging
 * Call this from a button to debug token issues
 */
export async function forceGetPushToken(): Promise<string | null> {
  console.log('🔄 FORCE GET PUSH TOKEN - Starting...');
  
  try {
    // Step 1: Check platform (Skip device check for APK builds)
    console.log('1️⃣ Checking platform...');
    console.log('   Platform:', Platform.OS);
    console.log('   Is Device (may be false for APK):', Constants.isDevice);
    console.log('   ⚠️ Note: APK builds often report as emulator, continuing anyway...');
    
    // Step 2: Check permissions
    console.log('2️⃣ Checking permissions...');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('   Current permission:', existingStatus);
    
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      console.log('   Requesting permissions...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('   New permission:', status);
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert('Permission Denied', 'Please enable notifications in Settings → Apps → Healthy Smiles → Notifications');
      return null;
    }
    
    console.log('   ✅ Permissions granted');
    
    // Step 3: Set up Android channel
    if (Platform.OS === 'android') {
      console.log('3️⃣ Setting up Android notification channel...');
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#34D399',
      });
      console.log('   ✅ Channel created');
    }
    
    // Step 4: Get project ID
    console.log('4️⃣ Checking project ID...');
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    console.log('   Project ID:', projectId || 'NOT FOUND');
    
    // Step 5: Get push token
    console.log('5️⃣ Attempting to get Expo Push Token...');
    let token: string | null = null;
    
    try {
      if (projectId) {
        console.log('   Method: Using project ID');
        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
        token = tokenData.data;
        console.log('   ✅ SUCCESS via project ID');
      } else {
        console.log('   Method: Without project ID');
        const tokenData = await Notifications.getExpoPushTokenAsync();
        token = tokenData.data;
        console.log('   ✅ SUCCESS without project ID');
      }
    } catch (expoError: any) {
      console.log('   ❌ Expo token failed:', expoError.message);
      console.log('   Trying device token method...');
      
      try {
        const deviceTokenData = await Notifications.getDevicePushTokenAsync();
        const deviceToken = deviceTokenData.data;
        
        if (Platform.OS === 'android' && typeof deviceToken === 'string') {
          token = `ExponentPushToken[${deviceToken}]`;
          console.log('   ✅ SUCCESS via device token (formatted)');
        } else {
          token = String(deviceToken);
          console.log('   ✅ SUCCESS via device token');
        }
      } catch (deviceError: any) {
        console.log('   ❌ Device token also failed:', deviceError.message);
        console.log('   Full error:', deviceError);
        
        Alert.alert(
          'Token Retrieval Failed',
          `Could not get push token.\n\nError: ${deviceError.message}\n\nThis usually means:\n• Google Play Services not installed\n• Network connectivity issue\n• Device incompatibility`,
          [{ text: 'OK' }]
        );
        return null;
      }
    }
    
    if (token) {
      console.log('🎉 FINAL RESULT:');
      console.log('   Token:', token);
      console.log('   Length:', token.length);
      console.log('   Type:', token.startsWith('ExponentPushToken[') ? 'Expo Format' : 'Raw');
      
      Alert.alert(
        'Success! ✅',
        `Push token obtained!\n\nToken: ${token.substring(0, 50)}...\n\nLength: ${token.length} characters`,
        [
          {
            text: 'Copy Full Token',
            onPress: () => {
              console.log('FULL TOKEN:', token);
              Alert.alert('Token Copied to Console', 'Check the console/logs for the full token');
            }
          },
          { text: 'OK' }
        ]
      );
      
      return token;
    } else {
      console.log('❌ No token obtained');
      Alert.alert('Failed', 'Could not obtain push token. Check console logs for details.');
      return null;
    }
    
  } catch (error: any) {
    console.error('❌ CRITICAL ERROR:', error);
    console.error('Stack:', error.stack);
    Alert.alert('Error', `Critical error: ${error.message}`);
    return null;
  }
}
