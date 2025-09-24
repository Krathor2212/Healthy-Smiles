import React from 'react';
import { StyleSheet, View, Image, Button } from 'react-native';
import LogoAnimation from '../components/ui/logo-animation';
import { NavigationProp } from '@react-navigation/native';
export default function Welcome({ navigation }: { navigation: NavigationProp<any> }) {
  const handleStartPress = () => {
    navigation.navigate('Intro1'); // Navigate to the Intro1 page
  };

  return (
    <View style={styles.container}>
      {/* Logo at the top */}
      <Image
        source={require('../assets/logo.jpg')}
        style={styles.logo}
      />

      {/* Animation and button in the center */}
      <View style={styles.logoContainer}>
        <LogoAnimation />
        <View style={styles.buttonContainer}>
          <Button title="Start" onPress={handleStartPress} color="#1F7A71" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F7A71',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 1000,
    height: 500,
    resizeMode: 'contain',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    width: '80%',
  },
});
