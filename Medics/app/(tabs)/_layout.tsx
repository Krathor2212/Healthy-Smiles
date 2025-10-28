import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import React from 'react';
import EditProfileScreen from '../Home/EditProfile';
import Home from '../Home/Home';
import MedicalFilesScreen from '../Home/MedicalFiles';
import ProfileScreen from '../Home/Profile';
import LoginScreen from '../Login/Login';
import SignUpScreen from '../Login/Signup';
import ArticlesScreen from '../Pages/Articles';
import AppointmentScreen from '../Pages/Doctors/Appointment';
import DoctorDetailsScreen from '../Pages/Doctors/DoctorDetails';
import FindDoctorsScreen from '../Pages/Doctors/FindDoctors';
import TopDoctorScreen from '../Pages/Doctors/Topdoctor';
import CartScreen from '../Pages/Pharmacy/CartScreen';
import DrugDetailScreen from '../Pages/Pharmacy/DrugDetailScreen';
import PharmacyScreen from '../Pages/Pharmacy/PharmacyScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <Stack.Navigator
      initialRouteName="Intro"
      screenOptions={{
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
      }}
    >
      {/* <Stack.Screen
        name="Intro"
        component={InvitesScreen}
        options={{ headerShown: false }}
      /> */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="articles" component={ArticlesScreen} />
      <Stack.Screen name="CartScreen" component={CartScreen} />
      <Stack.Screen name="PharmacyScreen" component={PharmacyScreen} />
      <Stack.Screen name="DrugDetailScreen" component={DrugDetailScreen} />
      <Stack.Screen name="DoctorDetails" component={DoctorDetailsScreen} />
      <Stack.Screen name="Appointment" component={AppointmentScreen} />
      <Stack.Screen name="topdoctor" component={TopDoctorScreen} />
      <Stack.Screen name="FindDoctorsScreen" component={FindDoctorsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="MedicalFiles" component={MedicalFilesScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}