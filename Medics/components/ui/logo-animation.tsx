import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';

const frames = [
  require('../../assets/animation/frame 1.jpg'),
  require('../../assets/animation/frame 2.jpg'),
  require('../../assets/animation/frame 3.jpg'),
  require('../../assets/animation/frame 4.jpg'),
];

const LogoAnimation = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateFrames = () => {
      Animated.loop(
        Animated.sequence(
          frames.map((_, index) =>
            Animated.timing(animatedValue, {
              toValue: index,
              duration: 750, // Duration for each frame
              useNativeDriver: false,
            })
          )
        )
      ).start();
    };

    animateFrames();
  }, [animatedValue]);

  const [currentFrame, setCurrentFrame] = React.useState(0);

  useEffect(() => {
    const listenerId = animatedValue.addListener(({ value }) => {
      setCurrentFrame(Math.round(value));
    });

    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, [animatedValue]);

  return (
    <Animated.Image
      source={frames[currentFrame]} // Dynamically select the frame
      style={styles.logo}
    />
  );
};

const styles = StyleSheet.create({
  logo: {
    width: 300,
    height: 200,
    resizeMode: 'contain',
  },
});

export default LogoAnimation;