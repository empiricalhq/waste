import { useEffect } from "react";
import {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

/**
 * A hook that provides an animated style for a pulsing opacity effect.
 * Why? Skeleton loaders.
 * @param duration - The duration of one pulse cycle (in ms).
 * @returns An animated style object to be passed to an Animated.View.
 */
export function usePulsingAnimation(duration = 1000) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration }), -1, true);

    return () => {
      cancelAnimation(opacity);
    };
  }, [duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return animatedStyle;
}
