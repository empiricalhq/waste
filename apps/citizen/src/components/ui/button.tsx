import type React from "react";
import type { GestureResponderEvent } from "react-native";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
  View,
} from "react-native";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/constants/design-tokens";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { hapticSelection } from "@/lib/utils/haptics";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "link"
    | "text";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  icon,
  iconPosition = "left",
  style,
  accessibilityLabel,
  accessibilityHint,
  onPress,
  ...props
}) => {
  const reducedMotion = useReducedMotion();
  const containerStyle = [
    styles.container,
    styles[`${size}Container`],
    styles[`${variant}Container`],
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`${size}Text`],
    styles[`${variant}Text`],
  ];

  const getLoaderColor = () => {
    switch (variant) {
      case "primary":
      case "danger":
        return Colors.textInverse;
      case "ghost":
      case "link":
      case "text":
        return Colors.primary;
      default:
        return Colors.text;
    }
  };

  const handlePress = (event: GestureResponderEvent) => {
    if (!(disabled || loading)) {
      hapticSelection();
      onPress?.(event);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={getLoaderColor()} />;
    }

    if (icon) {
      return (
        <View style={styles.contentWithIcon}>
          {iconPosition === "left" && icon}
          <Text style={textStyle}>{title}</Text>
          {iconPosition === "right" && icon}
        </View>
      );
    }

    return <Text style={textStyle}>{title}</Text>;
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      disabled={disabled || loading}
      activeOpacity={reducedMotion ? 1 : 0.8}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      onPress={handlePress}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

export { Button };

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44, // minimum touch target
  },
  // size variants
  smContainer: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  mdContainer: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  lgContainer: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  // Style variants
  primaryContainer: {
    backgroundColor: Colors.primary,
  },
  secondaryContainer: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  outlineContainer: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  ghostContainer: {
    backgroundColor: "transparent",
  },
  dangerContainer: {
    backgroundColor: Colors.error,
  },
  // text styles
  text: {
    fontWeight: Typography.fontWeight.medium,
  },
  smText: {
    fontSize: Typography.fontSize.sm,
  },
  mdText: {
    fontSize: Typography.fontSize.base,
  },
  lgText: {
    fontSize: Typography.fontSize.lg,
  },
  primaryText: {
    color: Colors.textInverse,
  },
  secondaryText: {
    color: Colors.text,
  },
  outlineText: {
    color: Colors.primary,
  },
  ghostText: {
    color: Colors.primary,
  },
  dangerText: {
    color: Colors.textInverse,
  },
  linkContainer: {
    backgroundColor: "transparent",
  },
  linkText: {
    color: Colors.primary,
    textDecorationLine: "underline",
  },
  textContainer: {
    backgroundColor: "transparent",
  },
  textText: {
    color: Colors.primary,
  },
  contentWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  disabled: {
    opacity: 0.6,
  },
});
