import type React from "react";
import { useEffect } from "react";
import type { ViewProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import {
  createEntranceAnimation,
  createFadeAnimation,
} from "@/lib/utils/animations";

interface AnimatedViewProps extends ViewProps {
  children: React.ReactNode;
  index?: number;
  animationType?: "entrance" | "fade";
  visible?: boolean;
}

const AnimatedView: React.FC<AnimatedViewProps> = ({
  children,
  style,
  index = 0,
  animationType = "entrance",
  visible = true,
  ...props
}) => {
  const reducedMotion = useReducedMotion();
  let initialOpacity = 0;
  if (animationType !== "entrance") {
    initialOpacity = visible ? 1 : 0;
  }
  const opacity = useSharedValue(initialOpacity);
  const translateY = useSharedValue(animationType === "entrance" ? 50 : 0);

  useEffect(() => {
    if (animationType === "entrance") {
      const animation = createEntranceAnimation(index, reducedMotion);
      opacity.value = animation.opacity;
      translateY.value = animation.translateY;
    } else if (animationType === "fade") {
      opacity.value = createFadeAnimation(reducedMotion, visible);
    }
  }, [index, reducedMotion, visible, animationType, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    if (animationType === "entrance") {
      return {
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
      };
    }
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
};

export { AnimatedView };
