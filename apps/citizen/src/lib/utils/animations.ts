import { withDelay, withSpring, withTiming } from "react-native-reanimated";
import {
  ANIMATION_DURATIONS,
  EASING,
  SPRING_CONFIGS,
  STAGGER_DELAY,
} from "@/constants/animations";

/**
 * Creates entrance animation values for a component
 * Respects reduced motion preferences
 *
 * @param index - Index for stagger delay
 * @param reducedMotion - Whether reduced motion is enabled
 * @returns Animation values for opacity and translateY
 */
export const createEntranceAnimation = (
  index: number,
  reducedMotion: boolean,
) => {
  if (reducedMotion) {
    return {
      opacity: 1,
      translateY: 0,
    };
  }

  const delay = index * STAGGER_DELAY;

  return {
    opacity: withDelay(
      delay,
      withTiming(1, {
        duration: ANIMATION_DURATIONS.NORMAL,
      }),
    ),
    translateY: withDelay(delay, withSpring(0, SPRING_CONFIGS.DEFAULT)),
  };
};

/**
 * Creates press animation for interactive elements
 * Respects reduced motion preferences
 *
 * @param reducedMotion - Whether reduced motion is enabled
 * @param pressed - Whether element is pressed
 * @returns Animation value for scale
 */
export const createPressAnimation = (
  reducedMotion: boolean,
  pressed: boolean,
) => {
  if (reducedMotion) {
    return 1;
  }
  const PressedScale = 0.95;
  const DefaultScale = 1;

  return withTiming(pressed ? PressedScale : DefaultScale, {
    duration: ANIMATION_DURATIONS.QUICK,
    easing: EASING.OUT_QUAD,
  });
};

/**
 * Creates exit animation values for a component
 * Respects reduced motion preferences
 *
 * @param reducedMotion - Whether reduced motion is enabled
 * @param direction - Direction of exit ('left' | 'right' | 'up' | 'down')
 * @returns Animation values for opacity and translate
 */
export const createExitAnimation = (
  reducedMotion: boolean,
  direction: "left" | "right" | "up" | "down" = "left",
) => {
  if (reducedMotion) {
    return {
      opacity: 0,
      translateX: 0,
      translateY: 0,
    };
  }

  const SlideDistance = 300;
  const distance = SlideDistance;
  let translateX = 0;
  if (direction === "left") {
    translateX = -distance;
  } else if (direction === "right") {
    translateX = distance;
  }

  let translateY = 0;
  if (direction === "up") {
    translateY = -distance;
  } else if (direction === "down") {
    translateY = distance;
  }

  return {
    opacity: withTiming(0, {
      duration: ANIMATION_DURATIONS.QUICK,
    }),
    translateX: withTiming(translateX, {
      duration: ANIMATION_DURATIONS.QUICK,
      easing: EASING.IN_OUT_CUBIC,
    }),
    translateY: withTiming(translateY, {
      duration: ANIMATION_DURATIONS.QUICK,
      easing: EASING.IN_OUT_CUBIC,
    }),
  };
};

/**
 * Creates fade animation
 * Respects reduced motion preferences
 *
 * @param reducedMotion - Whether reduced motion is enabled
 * @param visible - Whether element should be visible
 * @param duration - Animation duration (optional)
 * @returns Animation value for opacity
 */
export const createFadeAnimation = (
  reducedMotion: boolean,
  visible: boolean,
  duration: number = ANIMATION_DURATIONS.NORMAL,
) => {
  if (reducedMotion) {
    return visible ? 1 : 0;
  }

  return withTiming(visible ? 1 : 0, {
    duration,
  });
};

/**
 * Creates scale animation
 * Respects reduced motion preferences
 *
 * @param reducedMotion - Whether reduced motion is enabled
 * @param scale - Target scale value
 * @param useSpring - Whether to use spring animation
 * @returns Animation value for scale
 */
export const createScaleAnimation = (
  reducedMotion: boolean,
  scale: number,
  useSpring = true,
) => {
  if (reducedMotion) {
    return scale;
  }

  if (useSpring) {
    return withSpring(scale, SPRING_CONFIGS.DEFAULT);
  }

  return withTiming(scale, {
    duration: ANIMATION_DURATIONS.NORMAL,
    easing: EASING.OUT_CUBIC,
  });
};

/**
 * Creates slide animation
 * Respects reduced motion preferences
 *
 * @param reducedMotion - Whether reduced motion is enabled
 * @param from - Starting position
 * @param to - Ending position
 * @param delay - Optional delay
 * @returns Animation value for translate
 */
export const createSlideAnimation = (
  reducedMotion: boolean,
  _from: number,
  to: number,
  delay = 0,
) => {
  if (reducedMotion) {
    return to;
  }

  return withDelay(
    delay,
    withTiming(to, {
      duration: ANIMATION_DURATIONS.NORMAL,
      easing: EASING.OUT_CUBIC,
    }),
  );
};
