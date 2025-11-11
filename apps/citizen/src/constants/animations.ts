import { Easing } from "react-native-reanimated";

/**
 * Animation duration constants
 * Most animations 200-300ms, max 1s
 */
export const ANIMATION_DURATIONS = {
  QUICK: 200, // For simple transitions (hover, press)
  NORMAL: 300, // For most animations (entrance, exit)
  SLOW: 500, // For emphasis (celebration start)
  CELEBRATION: 1000, // Maximum for illustrative animations
} as const;

/**
 * Use ease-out for most animations (elements entering, user interactions)
 */
export const EASING = {
  // ease-out: Best for elements entering or user interactions
  OUT_QUAD: Easing.bezier(0.25, 0.46, 0.45, 0.94),
  OUT_CUBIC: Easing.bezier(0.215, 0.61, 0.355, 1),
  OUT_QUART: Easing.bezier(0.165, 0.84, 0.44, 1),

  // ease-in-out: For elements moving within screen
  IN_OUT_CUBIC: Easing.bezier(0.645, 0.045, 0.355, 1),
  IN_OUT_QUART: Easing.bezier(0.77, 0, 0.175, 1),
} as const;

/**
 * Spring animation configurations
 * Default: spring animations, avoid bouncy unless for drag gestures
 */
export const SPRING_CONFIGS = {
  // default spring: not too bouncy, feels natural
  DEFAULT: { damping: 15, stiffness: 100, mass: 1 },
  // gentle spring: smooth, minimal bounce
  GENTLE: { damping: 20, stiffness: 90, mass: 1 },
  // only use bouncy for drag gestures
  BOUNCY: { damping: 8, stiffness: 100, mass: 0.8 },
} as const;

/**
 * Stagger delay for sequential animations
 */
export const STAGGER_DELAY = 100; // ms between each item

/**
 * Feedback colors for quiz states
 */
export const FEEDBACK_COLORS = {
  success: {
    background: "#E6F9F1",
    border: "#00C853",
    text: "#00C853",
  },
  error: {
    background: "#FEEBEE",
    border: "#FF5252",
    text: "#FF5252",
  },
  streak: {
    background: "#FFF3E0",
    border: "#FF9800",
    text: "#FF9800",
  },
} as const;
