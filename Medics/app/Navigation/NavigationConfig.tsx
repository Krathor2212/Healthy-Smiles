import { TransitionPresets, StackNavigationOptions } from '@react-navigation/stack';

// Bottom navigation tab screens
export const BOTTOM_NAV_SCREENS = ['Home', 'AllChatsScreen', 'Prescriptions', 'Profile'];

// Custom transition function for bottom navigation tabs
export const getTransition = ({ route }: any): StackNavigationOptions => {
  const transitionDirection = route.params?.transitionDirection;
  
  // Only apply custom transitions for bottom nav screens
  const isBottomNavScreen = BOTTOM_NAV_SCREENS.includes(route.name);
  
  if (isBottomNavScreen && transitionDirection === 'left-to-right') {
    // Slide from left to right (backward navigation)
    return {
      ...TransitionPresets.SlideFromRightIOS,
      gestureDirection: 'horizontal-inverted',
      transitionSpec: {
        open: {
          animation: 'spring',
          config: {
            stiffness: 1000,
            damping: 500,
            mass: 3,
            overshootClamping: true,
            restDisplacementThreshold: 0.01,
            restSpeedThreshold: 0.01,
          },
        },
        close: {
          animation: 'spring',
          config: {
            stiffness: 1000,
            damping: 500,
            mass: 3,
            overshootClamping: true,
            restDisplacementThreshold: 0.01,
            restSpeedThreshold: 0.01,
          },
        },
      },
      cardStyleInterpolator: ({ current, layouts }) => {
        return {
          cardStyle: {
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-layouts.screen.width, 0],
                }),
              },
            ],
          },
          overlayStyle: {
            opacity: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0],
            }),
          },
        };
      },
    };
  } else if (isBottomNavScreen && transitionDirection === 'right-to-left') {
    // Slide from right to left (forward navigation)
    return TransitionPresets.SlideFromRightIOS;
  }
  
  // Default transition for non-bottom nav screens
  return TransitionPresets.SlideFromRightIOS;
};

// Screen options configuration
export const defaultScreenOptions = ({ route }: any) => ({
  headerShown: false,
  ...getTransition({ route }),
});
