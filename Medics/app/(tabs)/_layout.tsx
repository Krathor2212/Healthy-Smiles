import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { default as InvitesScreen, default as Welcome } from '../InviteScreen'; // Import the Welcome page// Import the Intro1 page

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
        name="Intro"
        component={InvitesScreen}
        options={{ headerShown: false }} // Hide the header for the Intro1 page
      />
    </Stack.Navigator>
  );
}