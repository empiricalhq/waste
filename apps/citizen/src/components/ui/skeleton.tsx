import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { usePulsingAnimation } from "@/hooks/use-pulsing-animation";
import { theme } from "@/theme";

export function SkeletonCard() {
  const animatedStyle = usePulsingAnimation();

  return (
    <View style={styles.skeleton}>
      <Animated.View style={[styles.line, animatedStyle]} />
      <Animated.View style={[styles.line, styles.lineShort, animatedStyle]} />
    </View>
  );
}

export function SkeletonTruckCard() {
  const animatedStyle = usePulsingAnimation();

  return (
    <View style={[styles.skeleton, styles.truckCard]}>
      <View style={styles.row}>
        <Animated.View style={[styles.dot, animatedStyle]} />
        <View style={styles.content}>
          <Animated.View style={[styles.line, animatedStyle]} />
          <Animated.View
            style={[styles.line, styles.lineShort, animatedStyle]}
          />
        </View>
        <Animated.View style={[styles.eta, animatedStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  line: {
    height: 16,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.sm,
  },
  lineShort: {
    width: "60%",
  },
  truckCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  content: {
    flex: 1,
  },
  eta: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.backgroundSecondary,
  },
});
