import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming
} from 'react-native-reanimated';

type Props = {
  id: string | number;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  delayMultiplier?: number; // how much to stagger (e.g., 40ms per item)
  cardless?: boolean;
};

export default function JuicyTransitionWrapper({
  id,
  children,
  style,
  delayMultiplier = 40,
  cardless,
}: Props) {
  // Animated shared values
  const translateY = useSharedValue(30);
  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    const delay =
      delayMultiplier * (parseInt(String(id).replace(/\D/g, ''), 10) % 6);

    translateY.value = withDelay(
      delay,
      withSpring(0, { damping: 10, stiffness: 140 })
    );

    scale.value = withDelay(
      delay + 40,
      withSpring(1, { damping: 9, stiffness: 120 })
    );

    opacity.value = withDelay(
      delay + 20,
      withTiming(1, {
        duration: 100,
        easing: Easing.out(Easing.exp),
      })
    );
  }, [id]);

  // Animated style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      layout={LinearTransition.springify()
        .damping(20)
        .stiffness(140)
        .mass(1)
        .overshootClamping(0)
        .reduceMotion('always' as any)}
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
