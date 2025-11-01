import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppDataProvider } from '../contexts/AppDataContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { defaultScreenOptions } from '../Navigation/NavigationConfig';
import ScreenWrapper from '../components/ScreenWrapper';
import BottomNavigation from '../components/BottomNavigation';

// Auth Screens
import AuthOptions from '../components/AuthOptions';
import LoginScreen from '../Login/Login';
import SignUpScreen from '../Login/Signup';
import ForgotPasswordScreen from '../Login/ForgotPassword';
import InvitesScreen from '../InviteScreen';

// Home & Main Screens
import Home from '../Home/Home';
import ArticlesScreen from '../Pages/articles';
import InsuranceScreen from '../Home/Insurance';
import NotificationsScreen from '../Notifications';

// Profile Screens
import ProfileScreen from '../Pages/Profile/Profile';
import EditProfileScreen from '../Pages/Profile/EditProfile';
import MedicalFilesScreen from '../Pages/Profile/MedicalFiles';
import PaymentHistoryScreen from '../Pages/Profile/PaymentHistory';
import FAQsScreen from '../Pages/Profile/FAQScreen';

// Doctor Screens
import FindDoctorsScreen from '../Pages/Doctors/FindDoctors';
import DoctorDetailsScreen from '../Pages/Doctors/DoctorDetails';
import TopDoctorScreen from '../Pages/Doctors/Topdoctor';
import AppointmentScreen from '../Pages/Doctors/Appointment';

// Pharmacy Screens
import PharmacyScreen from '../Pages/Pharmacy/PharmacyScreen';
import DrugDetailScreen from '../Pages/Pharmacy/DrugDetailScreen';
import CartScreen from '../Pages/Pharmacy/CartScreen';

// Hospital Screens
import FindHospitals from '../Pages/Hospitals/FindHospitals';
import HospitalDetails from '../Pages/Hospitals/HospitalDetails';
import AppointmentsScheduleScreen from '../Pages/Hospitals/AppointmentsScheduleScreen';

// Chat Screens
import AllChatsScreen from '../Pages/Chat/AllChatsScreen';
import IndividualChatScreen from '../Pages/Chat/IndividualChatScreen';

// Prescription Screens
import PrescriptionsScreen from '../Pages/Prescriptions/PrescriptionsScreen';

const Stack = createStackNavigator();

// Wrapper components with BottomNavigation
const withBottomNav = (Component: React.ComponentType<any>) => {
  return (props: any) => (
    <View style={styles.container}>
      <ScreenWrapper showBottomNav={true}>
        <Component {...props} />
      </ScreenWrapper>
      <View style={styles.bottomNavWrapper}>
        <BottomNavigation />
      </View>
    </View>
  );
};

// Wrapper for screens without BottomNavigation
const withoutBottomNav = (Component: React.ComponentType<any>) => {
  return (props: any) => (
    <ScreenWrapper showBottomNav={false}>
      <Component {...props} />
    </ScreenWrapper>
  );
};

// Main navigation component
function MainNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Intro"
      screenOptions={defaultScreenOptions}
    >
      {/* Auth screens - NO BottomNavigation */}
      <Stack.Screen name="Intro" component={withoutBottomNav(InvitesScreen)} />
      <Stack.Screen name="AuthOptions" component={withoutBottomNav(AuthOptions)} />
      <Stack.Screen name="Login" component={withoutBottomNav(LoginScreen)} />
      <Stack.Screen name="SignUp" component={withoutBottomNav(SignUpScreen)} />
      <Stack.Screen name="ForgotPassword" component={withoutBottomNav(ForgotPasswordScreen)} />
      
      {/* Main app screens - WITH BottomNavigation */}
      <Stack.Screen name="Home" component={withBottomNav(Home)} />
      <Stack.Screen name="Notifications" component={withBottomNav(NotificationsScreen)} />
      <Stack.Screen name="articles" component={withBottomNav(ArticlesScreen)} />
      <Stack.Screen name="Insurance" component={withBottomNav(InsuranceScreen)} />
      
      {/* Chat Screens */}
      <Stack.Screen name="AllChatsScreen" component={withBottomNav(AllChatsScreen)} />
      <Stack.Screen name="IndividualChatScreen" component={withBottomNav(IndividualChatScreen)} />
      
      {/* Prescription Screens */}
      <Stack.Screen name="Prescriptions" component={withBottomNav(PrescriptionsScreen)} />
      
      {/* Profile Screens */}
      <Stack.Screen name="Profile" component={withBottomNav(ProfileScreen)} />
      <Stack.Screen name="EditProfile" component={withBottomNav(EditProfileScreen)} />
      <Stack.Screen name="MedicalFiles" component={withBottomNav(MedicalFilesScreen)} />
      <Stack.Screen name="PaymentHistory" component={withBottomNav(PaymentHistoryScreen)} />
      <Stack.Screen name="FAQs" component={withBottomNav(FAQsScreen)} />
      
      {/* Doctor Screens */}
      <Stack.Screen name="FindDoctorsScreen" component={withBottomNav(FindDoctorsScreen)} />
      <Stack.Screen name="DoctorDetails" component={withBottomNav(DoctorDetailsScreen)} />
      <Stack.Screen name="topdoctor" component={withBottomNav(TopDoctorScreen)} />
      <Stack.Screen name="Appointment" component={withBottomNav(AppointmentScreen)} />
      
      {/* Pharmacy Screens */}
      <Stack.Screen name="PharmacyScreen" component={withBottomNav(PharmacyScreen)} />
      <Stack.Screen name="DrugDetailScreen" component={withBottomNav(DrugDetailScreen)} />
      <Stack.Screen name="CartScreen" component={withBottomNav(CartScreen)} />
      
      {/* Hospital Screens */}
      <Stack.Screen name="FindHospitals" component={withBottomNav(FindHospitals)} />
      <Stack.Screen name="HospitalDetails" component={withBottomNav(HospitalDetails)} />
      <Stack.Screen name="Appointments" component={withBottomNav(AppointmentsScheduleScreen)} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AppDataProvider>
        <MainNavigator />
      </AppDataProvider>
    </NotificationProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomNavWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});