import { StyleSheet, Text } from "react-native";
import Animated from "react-native-reanimated";
import { Button } from "@/components/ui/button";
import { useFadeIn } from "@/hooks/use-fade-in";
import { theme } from "@/theme";

interface LearnMenuProps {
  onStart: () => void;
}

export function LearnMenu({ onStart }: LearnMenuProps) {
  const [animatedStyle, onLayout] = useFadeIn();

  return (
    <Animated.View
      onLayout={onLayout}
      style={[styles.container, animatedStyle]}
    >
      <Text style={styles.title}>Aprender</Text>
      <Text style={styles.description}>
        Aprende a clasificar diferentes tipos de residuos correctamente
      </Text>
      <Button title="Comenzar quiz" onPress={onStart} fullWidth={true} />
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
