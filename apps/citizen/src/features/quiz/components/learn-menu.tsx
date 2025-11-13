import { StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Button } from "@/components/ui/button";
import { theme } from "@/theme";

interface LearnMenuProps {
  onStart: () => void;
}

export function LearnMenu({ onStart }: LearnMenuProps) {
  const isVisible = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isVisible.value ? 1 : 0, {
      duration: theme.animation.duration.slow,
    }),
    transform: [
      {
        translateY: withSpring(isVisible.value ? 0 : 20, theme.animation.easing.spring),
      },
    ],
  }));

  const onLayout = () => {
    isVisible.value = true;
  };

  return (
    <Animated.View onLayout={onLayout} style={[styles.container, animatedStyle]}>
      <Text style={styles.title}>Aprender</Text>
      <Text style={styles.description}>
        Aprende a clasificar diferentes tipos de residuos correctamente
      </Text>
      <Button
        title="Comenzar quiz"
        onPress={onStart}
        fullWidth={true}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  description: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
});
