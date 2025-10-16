import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import React from 'react';
import ArticlesScreen from '../Home/articles';
import CartScreen from '../Home/CartScreen';
import DrugDetailScreen from '../Home/DrugDetailScreen';
import Home from '../Home/Home';
import PharmacyScreen from '../Home/PharmacyScreen';
import TopDoctorScreen from '../Home/topdoctor';
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
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="articles" component={ArticlesScreen} />
      <Stack.Screen name="CartScreen" component={CartScreen} />
      <Stack.Screen name="PharmacyScreen" component={PharmacyScreen} />
      <Stack.Screen name="DrugDetailScreen" component={DrugDetailScreen} />
      <Stack.Screen name="topdoctor" component={TopDoctorScreen} />
    </Stack.Navigator>
  );
}