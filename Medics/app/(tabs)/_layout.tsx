import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import React from 'react';
import { default as InvitesScreen } from '../InviteScreen';
import LoginScreen from '../login/Login';
import SignUpScreen from '../login/Signup';
const Stack = createStackNavigator();

export default function App() {
  return (
    <Stack.Navigator
      initialRouteName="Intro"
      screenOptions={{
        headerShown: false,
        // Use platform-appropriate smooth transitions
        ...TransitionPresets.SlideFromRightIOS,
      }}
    >
      <Stack.Screen
        name="Intro"
        component={InvitesScreen}
        options={{ headerShown: false }} // Hide the header for the Intro1 page
      />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}