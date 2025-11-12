import { Check, X } from "lucide-react-native";
import type React from "react";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  ANIMATION_DURATIONS,
  EASING,
  FEEDBACK_COLORS,
  SPRING_CONFIGS,
  STAGGER_DELAY,
} from "@/constants/animations";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/constants/design-tokens";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import {
  hapticError,
  hapticSelection,
  hapticSuccess,
} from "@/lib/utils/haptics";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface AnimatedOptionProps {
  label: string;
  isSelected: boolean;
  isCorrect: boolean;
  isAnswered: boolean;
  onPress: () => void;
  index: number;
  isVisible: boolean;
}

export const AnimatedOption: React.FC<AnimatedOptionProps> = ({
  label,
  isSelected,
  isCorrect,
  isAnswered,
  onPress,
  index,
  isVisible,
}) => {
  const reducedMotion = useReducedMotion();

  // Entrance animation values
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);

  // Interaction animation values
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const backgroundColor = useSharedValue<string>(Colors.cardBackground);
  const borderColor = useSharedValue<string>(Colors.border);

  // Entrance animation
  useEffect(() => {
    if (isVisible) {
      const delay = index * STAGGER_DELAY;

      if (reducedMotion) {
        translateY.value = 0;
        opacity.value = 1;
      } else {
        translateY.value = withDelay(
          delay,
          withSpring(0, SPRING_CONFIGS.DEFAULT),
        );
        opacity.value = withDelay(
          delay,
          withTiming(1, {
            duration: ANIMATION_DURATIONS.NORMAL,
          }),
        );
      }
    }

    return () => {
      cancelAnimation(translateY);
      cancelAnimation(opacity);
    };
  }, [isVisible, index, reducedMotion, opacity, translateY]);

  // Answer feedback animations
  useEffect(() => {
    if (isAnswered) {
      if (isCorrect) {
        hapticSuccess();
        backgroundColor.value = FEEDBACK_COLORS.success.background;
        borderColor.value = FEEDBACK_COLORS.success.border;

        if (!reducedMotion) {
          scale.value = withSequence(
            withSpring(1.05, SPRING_CONFIGS.DEFAULT),
            withSpring(1, SPRING_CONFIGS.DEFAULT),
          );
        }
      } else if (isSelected) {
        // Error animation
        hapticError();
        backgroundColor.value = FEEDBACK_COLORS.error.background;
        borderColor.value = FEEDBACK_COLORS.error.border;

        if (!reducedMotion) {
          // Shake animation
          translateX.value = withSequence(
            withTiming(-8, { duration: 50 }),
            withTiming(8, { duration: 50 }),
            withTiming(-8, { duration: 50 }),
            withTiming(0, { duration: 50 }),
          );
        }
      }
    }
  }, [
    isAnswered,
    isCorrect,
    isSelected,
    reducedMotion,
    backgroundColor,
    borderColor, // Success pulse
    scale, // Shake animation
    translateX,
  ]);

  const handlePressIn = () => {
    if (!isAnswered) {
      hapticSelection();
      if (!reducedMotion) {
        scale.value = withTiming(0.95, {
          duration: ANIMATION_DURATIONS.QUICK,
          easing: EASING.OUT_QUAD,
        });
      }
    }
  };

  const handlePressOut = () => {
    if (!(isAnswered || reducedMotion)) {
      scale.value = withTiming(1, {
        duration: ANIMATION_DURATIONS.QUICK,
        easing: EASING.OUT_QUAD,
      });
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
    backgroundColor: backgroundColor.value,
    borderColor: borderColor.value,
  }));

  return (
    <AnimatedTouchable
      style={[styles.option, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isAnswered}
      activeOpacity={0.7}
    >
      <Text style={styles.optionText}>{label}</Text>
      {isAnswered && isCorrect && (
        <Check color={FEEDBACK_COLORS.success.border} size={24} />
      )}
      {isAnswered && isSelected && !isCorrect && (
        <X color={FEEDBACK_COLORS.error.border} size={24} />
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.cardBackground,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    minHeight: 60,
  },
  optionText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    flex: 1,
  },
});
