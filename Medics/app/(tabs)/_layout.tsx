import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import React from 'react';
import { AppDataProvider } from '../contexts/AppDataContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import AuthOptions from '../components/AuthOptions';
import EditProfileScreen from '../Pages/Profile/EditProfile';
import Home from '../Home/Home';
import MedicalFilesScreen from '../Pages/Profile/MedicalFiles';
import ProfileScreen from '../Pages/Profile/Profile';
import PaymentHistoryScreen from '../Pages/Profile/PaymentHistory';
import LoginScreen from '../Login/Login';
import SignUpScreen from '../Login/Signup';
import ArticlesScreen from '../Pages/articles';
import AppointmentScreen from '../Pages/Doctors/Appointment';
import DoctorDetailsScreen from '../Pages/Doctors/DoctorDetails';
import FindDoctorsScreen from '../Pages/Doctors/FindDoctors';
import TopDoctorScreen from '../Pages/Doctors/Topdoctor';
import CartScreen from '../Pages/Pharmacy/CartScreen';
import DrugDetailScreen from '../Pages/Pharmacy/DrugDetailScreen';
import PharmacyScreen from '../Pages/Pharmacy/PharmacyScreen';
import InvitesScreen from '../InviteScreen';
import FindHospitals from '../Pages/Hospitals/FindHospitals';
import HospitalDetails from '../Pages/Hospitals/HospitalDetails';
import AppointmentsScheduleScreen from '../Pages/Hospitals/AppointmentsScheduleScreen';
import AllChatsScreen from '../Pages/Chat/AllChatsScreen';
import IndividualChatScreen from '../Pages/Chat/IndividualChatScreen';
import FAQsScreen from '../Pages/Profile/FAQScreen';
import NotificationsScreen from '../Notifications';
import InsuranceScreen from '../Home/Insurance';
import ForgotPasswordScreen from '../Login/ForgotPassword';
import ScreenWrapper from '../components/ScreenWrapper';

const Stack = createStackNavigator();

// Wrapper components with BottomNavigation
const withBottomNav = (Component: React.ComponentType<any>) => {
  return (props: any) => (
    <ScreenWrapper showBottomNav={true}>
      <Component {...props} />
    </ScreenWrapper>
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

export default function App() {
  return (
    <NotificationProvider>
      <AppDataProvider>
        <Stack.Navigator
          initialRouteName="Intro"
          screenOptions={{
            headerShown: false,
            ...TransitionPresets.SlideFromRightIOS,
          }}
        >
      {/* Auth screens - NO BottomNavigation */}
      <Stack.Screen
        name="Intro"
        component={withoutBottomNav(InvitesScreen)}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="AuthOptions" component={withoutBottomNav(AuthOptions)} />
      <Stack.Screen name="Login" component={withoutBottomNav(LoginScreen)} />
      <Stack.Screen name="SignUp" component={withoutBottomNav(SignUpScreen)} />
      <Stack.Screen name="ForgotPassword" component={withoutBottomNav(ForgotPasswordScreen)} />
      
      {/* Main app screens - WITH BottomNavigation */}
      <Stack.Screen name="Home" component={withBottomNav(Home)} />
      <Stack.Screen name="AllChatsScreen" component={withBottomNav(AllChatsScreen)} />
      <Stack.Screen name="IndividualChatScreen" component={withBottomNav(IndividualChatScreen)} />
      <Stack.Screen name="articles" component={withBottomNav(ArticlesScreen)} />
      <Stack.Screen name="CartScreen" component={withBottomNav(CartScreen)} />
      <Stack.Screen name="PharmacyScreen" component={withBottomNav(PharmacyScreen)} />
      <Stack.Screen name="DrugDetailScreen" component={withBottomNav(DrugDetailScreen)} />
      <Stack.Screen name="DoctorDetails" component={withBottomNav(DoctorDetailsScreen)} />
      <Stack.Screen name="Appointment" component={withBottomNav(AppointmentScreen)} />
      <Stack.Screen name="topdoctor" component={withBottomNav(TopDoctorScreen)} />
      <Stack.Screen name="FindDoctorsScreen" component={withBottomNav(FindDoctorsScreen)} />
      <Stack.Screen name="Profile" component={withBottomNav(ProfileScreen)} />
      <Stack.Screen name="MedicalFiles" component={withBottomNav(MedicalFilesScreen)} />
      <Stack.Screen name="EditProfile" component={withBottomNav(EditProfileScreen)} />
      <Stack.Screen name="FAQs" component={withBottomNav(FAQsScreen)} />
      <Stack.Screen name="PaymentHistory" component={withBottomNav(PaymentHistoryScreen)} />
      <Stack.Screen name="Notifications" component={withBottomNav(NotificationsScreen)} />
      <Stack.Screen name="Insurance" component={withBottomNav(InsuranceScreen)} />
      <Stack.Screen name="FindHospitals" component={withBottomNav(FindHospitals)} />
      <Stack.Screen name="HospitalDetails" component={withBottomNav(HospitalDetails)} />
      <Stack.Screen name="Appointments" component={withBottomNav(AppointmentsScheduleScreen)} />
      </Stack.Navigator>
    </AppDataProvider>
    </NotificationProvider>
  );
}