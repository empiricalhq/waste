import { useCallback } from "react";
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
 * A hook to fade in a component when it's laid out.
 * @param options - Configuration for the animation.
 * @returns A tuple containing the animated style and the onLayout handler.
 */
export function useFadeIn(options: FadeInOptions = {}) {
  const { duration = theme.animation.duration.slow, translateY = 20 } = options;

  const isVisible = useSharedValue(false);

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

  const onLayout = useCallback(() => {
    isVisible.value = true;
  }, [isVisible]);

  return [animatedStyle, onLayout] as const;
}
