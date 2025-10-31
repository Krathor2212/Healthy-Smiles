// components/ScreenWrapper.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import BottomNavigation from './BottomNavigation';

interface ScreenWrapperProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
}

export default function ScreenWrapper({ children, showBottomNav = true }: ScreenWrapperProps) {
  if (!showBottomNav) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      {children}
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
