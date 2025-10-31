import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming
} from 'react-native-reanimated';

type Props = {
  id: string | number;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  delayMultiplier?: number; // how much to stagger (e.g., 100ms per item)
  cardless?: boolean;
};

export default function JuicyTransitionWrapper({
  id,
  children,
  style,
  delayMultiplier = 100,
  cardless,
}: Props) {
  // Animated shared values
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    const index = parseInt(String(id).replace(/\D/g, ''), 10);
    const delay = delayMultiplier * (index % 10); // Support up to 10 items staggered

    // Smooth fade in with subtle slide up
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration: 600,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Smooth ease-out curve
      })
    );

    translateY.value = withDelay(
      delay,
      withTiming(0, {
        duration: 600,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );
  }, [id, delayMultiplier]);

  // Animated style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        cardless ? styles.cardless : styles.card,
        animatedStyle,
        style,
      ]}
      collapsable={false}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardless: {
    backgroundColor: 'transparent',
    padding: 0,
    marginVertical: 0,
  },
});
