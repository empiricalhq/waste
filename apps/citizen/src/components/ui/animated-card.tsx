import type React from "react";
import { useEffect } from "react";
import { StyleSheet, type ViewProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { BorderRadius, Colors, Spacing } from "@/constants/design-tokens";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { createEntranceAnimation } from "@/lib/utils/animations";

interface AnimatedCardProps extends ViewProps {
  children: React.ReactNode;
  index?: number;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  style,
  index = 0,
  ...props
}) => {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    const animation = createEntranceAnimation(index, reducedMotion);
    opacity.value = animation.opacity;
    translateY.value = animation.translateY;
  }, [index, reducedMotion, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.card, animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
});

export { AnimatedCard };
