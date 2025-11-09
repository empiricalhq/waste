import type React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, type TouchableOpacityProps } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/design-tokens';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  style,
  ...props
}) => {
  const containerStyle = [
    styles.container,
    styles[`${size}Container`],
    styles[`${variant}Container`],
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyle = [styles.text, styles[`${size}Text`], styles[`${variant}Text`]];

  const getLoaderColor = () => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return Colors.textInverse;
      case 'ghost':
        return Colors.primary;
      default:
        return Colors.text;
    }
  };

  return (
    <TouchableOpacity style={containerStyle} disabled={disabled || loading} activeOpacity={0.8} {...props}>
      {loading ? <ActivityIndicator color={getLoaderColor()} /> : <Text style={textStyle}>{title}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // Minimum touch target
  },
  // Size variants
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
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  dangerContainer: {
    backgroundColor: Colors.error,
  },
  // Text styles
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
  disabled: {
    opacity: 0.6,
  },
});
