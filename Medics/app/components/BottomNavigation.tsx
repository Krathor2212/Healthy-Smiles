import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native";
import type { RootStackParamList } from '../Navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function BottomNavigation() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const [activeTab, setActiveTab] = React.useState("Home");

  // Update active tab based on current route
  useEffect(() => {
    const routeName = route.name;
    
    // Map route names to tab names - always update activeTab
    if (routeName === 'Home' || routeName === 'Notifications') {
      setActiveTab('Home');
    } else if (routeName === 'AllChatsScreen' || routeName === 'IndividualChatScreen') {
      setActiveTab('Chat');
    } else if (routeName === 'Prescriptions') {
      setActiveTab('Prescriptions');
    } else if (routeName === 'Profile' || routeName === 'EditProfile' || routeName === 'MedicalFiles' || routeName === 'PaymentHistory' || routeName === 'FAQs') {
      setActiveTab('Profile');
    } else {
      // For any other screen, determine which tab section it belongs to
      // Default to Home if no match
      setActiveTab('Home');
    }
  }, [route.name]);

  const tabs = [
    {
      name: "Home",
      icon: "home-outline",
      activeIcon: "home",
      screen: "Home" as keyof RootStackParamList,
    },
    {
      name: "Chat",
      icon: "chatbubble-outline",
      activeIcon: "chatbubble",
      screen: "AllChatsScreen" as keyof RootStackParamList,
    },
    {
      name: "Prescriptions",
      icon: "medical-outline",
      activeIcon: "medical",
      screen: "Prescriptions" as keyof RootStackParamList,
    },
    {
      name: "Profile",
      icon: "person-outline",
      activeIcon: "person",
      screen: "Profile" as keyof RootStackParamList,
    },
  ];

  const handleTabPress = (screen: keyof RootStackParamList, tabName: string) => {
    // Determine transition direction based on tab order
    const tabOrder = ['Home', 'Chat', 'Prescriptions', 'Profile'];
    const currentIndex = tabOrder.indexOf(activeTab);
    const targetIndex = tabOrder.indexOf(tabName);
    
    // Calculate direction: if moving to a higher index (right), use right-to-left transition
    // if moving to a lower index (left), use left-to-right transition
    const transitionDirection = targetIndex > currentIndex ? 'right-to-left' : 'left-to-right';
    
    // Navigate with transition direction parameter
    navigation.navigate(screen, { transitionDirection } as any);
  };

  return (
    <View style={bottomNavStyles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          style={bottomNavStyles.tab}
          onPress={() => handleTabPress(tab.screen, tab.name)}
        >
          <Ionicons
            name={activeTab === tab.name ? (tab.activeIcon as any) : (tab.icon as any)}
            size={24}
            color={activeTab === tab.name ? "#3CB179" : "#6B7280"}
          />
          <Text
            style={[
              bottomNavStyles.tabText,
              { color: activeTab === tab.name ? "#3CB179" : "#6B7280" },
            ]}
          >
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const bottomNavStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
});