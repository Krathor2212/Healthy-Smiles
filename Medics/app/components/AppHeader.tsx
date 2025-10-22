import { Feather, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  /** Optional handler when the profile icon is pressed. If provided, a profile icon will render to the right. */
  onProfilePress?: () => void;
};

export default function AppHeader({ title, onBack, right, onProfilePress }: Props) {
  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Feather name="chevron-left" size={18} color="#1A202C" />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.right}>
          {right}
          {onProfilePress ? (
            <Ionicons
              name="person-circle-outline"
              size={28}
              color="#1A202C"
              onPress={onProfilePress}
              style={styles.profileIcon}
            />
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  right: {
    minWidth: 44,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  }
  ,
  profileIcon: {
    marginLeft: 8,
  }
});
