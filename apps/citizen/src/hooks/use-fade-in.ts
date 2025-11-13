import { useEffect } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { theme } from "@/theme";

interface FadeInOptions {
  duration?: number;
  translateY?: number;
}

/**
 * A hook to fade in a component when it's mounted.
 * @param options - Configuration for the animation.
 * @returns An animated style object.
 */
export function useFadeIn(options: FadeInOptions = {}) {
  const { duration = theme.animation.duration.slow, translateY = 20 } = options;

  const isVisible = useSharedValue(false);

  useEffect(() => {
    isVisible.value = true;
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isVisible.value ? 1 : 0, { duration }),
    transform: [
      {
        translateY: withSpring(
          isVisible.value ? 0 : translateY,
          theme.animation.easing.spring,
        ),
      },
    ],
  }));

  return animatedStyle;
}
