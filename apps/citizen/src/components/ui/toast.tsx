import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import FastSquircleView from "react-native-fast-squircle";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { type Toast as ToastType, useToast } from "@/context/toast-context";
import { theme } from "@/theme";

interface ToastProps {
  toast: ToastType;
  index: number;
}

const getBackgroundColor = (type: ToastType["options"]["type"]): string => {
  switch (type) {
    case "success":
      return theme.colors.accentIncome;
    case "error":
      return theme.colors.accentError;
    default:
      return theme.colors.backgroundDark;
  }
};

export function Toast({ toast }: ToastProps) {
  const { dismiss } = useToast();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50); // Start from bottom

  useEffect(() => {
    // animate in
    opacity.value = withSpring(1, theme.animation.spring);
    translateY.value = withSpring(0, theme.animation.spring);
  }, [opacity, translateY]);

  const handleDismiss = () => {
    // animate out
    opacity.value = withTiming(0, { duration: theme.animation.duration.short });
    translateY.value = withTiming(50, {
      duration: theme.animation.duration.short,
    });
    setTimeout(() => {
      dismiss(toast.id);
    }, theme.animation.duration.short);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const backgroundColor = getBackgroundColor(toast.options.type);
  const textColor = theme.colors.textOnDark;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable onPress={handleDismiss}>
        <FastSquircleView
          style={[styles.toast, { backgroundColor }, theme.shadow["shadow-soft"]]}
          cornerSmoothing={0.8}
        >
          <View style={styles.content}>
            <Text style={[styles.text, { color: textColor }]}>
              {toast.content}
            </Text>
          </View>
          {toast.options.action && (
            <Pressable
              style={styles.actionButton}
              onPress={() => {
                toast.options.action?.onPress();
                handleDismiss();
              }}
            >
              <Text style={styles.actionText}>
                {toast.options.action.label}
              </Text>
            </Pressable>
          )}
        </FastSquircleView>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing["spacing-l"],
    marginBottom: theme.spacing["spacing-m"],
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing["spacing-l"],
    borderRadius: theme.radius["radius-m"],
    minHeight: 56,
  },
  content: {
    flex: 1,
  },
  text: {
    ...theme.typography.callout,
    lineHeight: 22,
  },
  actionButton: {
    paddingHorizontal: theme.spacing["spacing-m"],
    paddingVertical: theme.spacing["spacing-s"],
    borderRadius: theme.radius["radius-xs"],
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginLeft: theme.spacing["spacing-m"],
  },
  actionText: {
    color: theme.colors.textOnDark,
    ...theme.typography.subhead,
  },
});
