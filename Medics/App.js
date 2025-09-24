import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Welcome from './app/welcome';
import Intro1 from './app/intro/intro1';

const Stack = createStackNavigator();

export default function App() {
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