import type React from "react";
import {
  Modal as RNModal,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useReducedMotion,
} from "react-native-reanimated";
import { Button } from "@/components/ui/button";
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from "@/constants/design-tokens";

interface ModalProps extends ViewProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  primaryAction?: {
    label: string;
    onPress: () => void;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  message,
  primaryAction,
  secondaryAction,
}) => {
  const reducedMotion = useReducedMotion();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View
        style={styles.overlay}
        entering={reducedMotion ? undefined : FadeIn.duration(200)}
        exiting={reducedMotion ? undefined : FadeOut.duration(200)}
      >
        <Animated.View
          style={styles.content}
          entering={
            reducedMotion ? undefined : SlideInDown.duration(300).springify()
          }
          exiting={reducedMotion ? undefined : SlideOutDown.duration(200)}
        >
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            {secondaryAction && (
              <Button
                title={secondaryAction.label}
                variant="secondary"
                onPress={secondaryAction.onPress}
                style={styles.button}
              />
            )}
            {primaryAction && (
              <Button
                title={primaryAction.label}
                onPress={primaryAction.onPress}
                style={styles.button}
              />
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  content: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: "100%",
    maxWidth: 400,
    ...Shadows.lg,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  message: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  button: {
    flex: 1,
  },
});
