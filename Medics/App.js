import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Welcome from './app/welcome';
import Intro1 from './app/intro/intro1';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    if (__DEV__) {
      // in dev, clear session so reloading the app resets to first-run state
      (async () => {
        try {
          await AsyncStorage.multiRemove(['token', 'hasSession', 'userProfile']);
          console.log('Dev: cleared session storage');
        } catch (e) {
          console.warn('Dev: failed to clear session', e);
        }
      })();
    }
  }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen
          name="Welcome"
          component={Welcome}
          options={{ headerShown: false }} // Hide the header for the Welcome page
        />
        <Stack.Screen
          name="Intro1"
          component={Intro1}
          options={{ headerShown: false }} // Hide the header for the Intro1 page
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}