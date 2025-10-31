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
    
    // Map route names to tab names
    if (routeName === 'Home' || routeName === 'Notifications') {
      setActiveTab('Home');
    } else if (routeName === 'AllChatsScreen' || routeName === 'IndividualChatScreen') {
      setActiveTab('Chat');
    } else if (routeName === 'Profile' || routeName === 'EditProfile' || routeName === 'MedicalFiles' || routeName === 'PaymentHistory' || routeName === 'FAQs') {
      setActiveTab('Profile');
    }
    // Keep the previously active tab for other screens
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
      name: "Profile",
      icon: "person-outline",
      activeIcon: "person",
      screen: "Profile" as keyof RootStackParamList,
    },
  ];

  const handleTabPress = (screen: keyof RootStackParamList, tabName: string) => {
    setActiveTab(tabName);
    navigation.navigate(screen);
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