import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Welcome from '../welcome'; // Import the Welcome page
import Intro1 from '../intro/intro1'; // Import the Intro1 page

const Stack = createStackNavigator();

export default function App() {
  return (
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
  );
}