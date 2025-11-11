import { RefreshCw, WifiOff } from "lucide-react-native";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/constants/design-tokens";

interface OfflineBannerProps {
  isVisible?: boolean;
  onRetry?: () => void;
  pendingMutations?: number;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isVisible = true,
  onRetry,
  pendingMutations = 0,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      // slide in
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
      });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      // slide out
      translateY.value = withTiming(100, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [isVisible, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { bottom: insets.bottom || Spacing.md },
        animatedStyle,
      ]}
    >
      <View style={styles.content}>
        <WifiOff size={16} color={Colors.textInverse} />
        <Text style={styles.text}>
          Sin conexión
          {pendingMutations > 0 && ` • ${pendingMutations} pendientes`}
        </Text>
      </View>

      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={styles.retryButton}
          activeOpacity={0.7}
        >
          <RefreshCw size={16} color={Colors.textInverse} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.text,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  text: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  retryButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
});
