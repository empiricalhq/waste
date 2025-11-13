import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { TOAST_CONFIG } from "@/constants";
import { type Toast as ToastType, useToast } from "@/context/toast-context";
import { theme } from "@/theme";

interface ToastProps {
  toast: ToastType;
  index: number;
}

const getBackgroundColor = (type: ToastType["options"]["type"]) => {
  switch (type) {
    case "success":
      return theme.colors.success;
    case "error":
      return theme.colors.error;
    case "warning":
      return theme.colors.warning;
    case "info":
      return theme.colors.info;
  }
};

const getIcon = (type: ToastType["options"]["type"]) => {
  switch (type) {
    case "success":
      return "✓";
    case "error":
      return "✗";
    case "warning":
      return "⚠";
    case "info":
      return "ℹ";
  }
};

export function Toast({ toast, index }: ToastProps) {
  const { dismiss } = useToast();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: TOAST_CONFIG.ANIMATION_DURATION,
    });
    translateY.value = withSpring(0, theme.animation.easing.spring);
  }, [opacity, translateY]);

  const handleDismiss = () => {
    dismiss(toast.id);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const backgroundColor = getBackgroundColor(toast.options.type);
  const icon = getIcon(toast.options.type);

  // Calculate offset based on index (stack effect)
  const bottomOffset = index * TOAST_CONFIG.STACK_OFFSET;

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        { marginBottom: bottomOffset },
      ]}
    >
      <Pressable
        style={[styles.toast, { backgroundColor }, theme.shadow.lg]}
        onPress={handleDismiss}
      >
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.content}>
          <Text style={styles.text} numberOfLines={2}>
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
            <Text style={styles.actionText}>{toast.options.action.label}</Text>
          </Pressable>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: theme.spacing.lg,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    minHeight: 56,
  },
  icon: {
    color: theme.colors.textInverse,
    fontSize: 18,
    marginRight: theme.spacing.md,
    fontWeight: theme.fontWeight.bold,
    width: 20,
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  text: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
    lineHeight: 20,
  },
  actionButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginLeft: theme.spacing.md,
  },
  actionText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
});
