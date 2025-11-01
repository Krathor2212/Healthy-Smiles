// components/ScreenWrapper.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ScreenWrapperProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
}

export default function ScreenWrapper({ children, showBottomNav = true }: ScreenWrapperProps) {
  return (
    <View style={showBottomNav ? styles.containerWithNav : styles.container}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerWithNav: {
    flex: 1,
    paddingBottom: 70, // Height of bottom navigation
  },
});
