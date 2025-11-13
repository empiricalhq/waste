import { useCallback, useEffect } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { type Toast as ToastType, useToast } from "@/context/ToastContext";
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
    default:
      return "#262626";
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
    default:
      return "";
  }
};

export function Toast({ toast, index }: ToastProps) {
  const { dismiss } = useToast();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(
    toast.options.position === "top" ? -100 : 100,
  );
  const scale = useSharedValue(0.9);

  const getStackOffset = useCallback(() => {
    const baseOffset = 4;
    const maxOffset = 12;
    const offset = Math.min(index * baseOffset, maxOffset);
    return toast.options.position === "top" ? offset : -offset;
  }, [index, toast.options.position]);

  const getStackScale = useCallback(() => {
    const scaleReduction = 0.02;
    const minScale = 0.94;
    return Math.max(1 - index * scaleReduction, minScale);
  }, [index]);

  const handleDismiss = () => {
    dismiss(toast.id);
  };

  useEffect(() => {
    const delay = index * 50;

    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration: theme.animation.duration.slow,
        easing: Easing.bezier(...theme.animation.easing.default),
      }),
    );

    translateY.value = withDelay(
      delay,
      withSpring(getStackOffset(), theme.animation.easing.spring),
    );
    scale.value = withDelay(
      delay,
      withSpring(getStackScale(), theme.animation.easing.spring),
    );
  }, []);

  // effect to update position if other toasts are dismissed (index changes)
  useEffect(() => {
    translateY.value = withSpring(
      getStackOffset(),
      theme.animation.easing.spring,
    );
    scale.value = withSpring(getStackScale(), theme.animation.easing.spring);
  }, [getStackOffset, getStackScale, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    zIndex: 1000 - index,
  }));

  const backgroundColor = getBackgroundColor(toast.options.type);
  const icon = getIcon(toast.options.type);

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        {
          position: "absolute",
          top: toast.options.position === "top" ? 0 : undefined,
          bottom: toast.options.position === "bottom" ? 0 : undefined,
        },
      ]}
    >
      <Pressable
        style={[styles.toast, { backgroundColor }, theme.shadow.lg]}
        onPress={handleDismiss}
        android_ripple={{ color: "rgba(255, 255, 255, 0.1)" }}
      >
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <View style={styles.content}>
          {typeof toast.content === "string" ? (
            <Text style={styles.text}>{toast.content}</Text>
          ) : (
            toast.content
          )}
        </View>
        {toast.options.action && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              toast.options.action?.onPress();
              handleDismiss();
            }}
          >
            <Text style={styles.actionText}>{toast.options.action.label}</Text>
          </TouchableOpacity>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "90%",
    maxWidth: 400,
    alignSelf: "center",
    marginVertical: 4,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
  },
  icon: {
    color: theme.colors.textInverse,
    fontSize: 20,
    marginRight: theme.spacing.md,
    fontWeight: theme.fontWeight.bold,
    textAlign: "center",
    width: 24,
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
