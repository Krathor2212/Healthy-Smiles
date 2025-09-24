import React from 'react';
import { StyleSheet, View, Image, Button, Alert } from 'react-native';
import LogoAnimation from '../components/ui/logo-animation'; // Import the new LogoAnimation component

export default function Login() {
  const handleStartPress = () => {
    Alert.alert('Start button pressed!');
  };

  return (
    <View style={styles.container}>
      {/* Logo at the top */}
      <Image
        source={require('../assets/logo.jpg')} // Replace with the correct path to your logo
        style={styles.logo}
      />

      {/* Animation and button in the center */}
      <View style={styles.logoContainer}>
        <LogoAnimation /> {/* Use the LogoAnimation component */}
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
    backgroundColor: '#1F7A71', // Set background to green
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally // Add padding for spacing
  },
  logo: {
    width: 1000, // Adjust width to fit the screen
    height: 500, // Adjust height to fit the screen
    resizeMode: 'contain', // Ensure the logo maintains its aspect ratio

  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: { // Add spacing between the animation and the button
    width: '80%',
  },
});
