import type React from 'react';
import { Text as RnText, type TextProps as RnTextProps, StyleSheet } from 'react-native';
import { Colors, Typography } from '@/constants/design-tokens';

type TextVariant = 'heading1' | 'heading2' | 'heading3' | 'body' | 'bodyLarge' | 'bodySmall' | 'caption' | 'label';

type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';

type TextColor = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'success' | 'error' | 'warning' | 'info';

interface TextProps extends RnTextProps {
  variant?: TextVariant;
  weight?: TextWeight;
  color?: TextColor;
  align?: 'left' | 'center' | 'right' | 'justify';
  children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  weight,
  color = 'primary',
  align = 'left',
  style,
  children,
  ...props
}) => {
  const textStyle = [
    styles.base,
    styles[variant],
    weight && styles[`weight_${weight}`],
    styles[`color_${color}`],
    { textAlign: align },
    style,
  ];

  return (
    <RnText style={textStyle} {...props}>
      {children}
    </RnText>
  );
};

const styles = StyleSheet.create({
  base: {
    color: Colors.text,
  },
  // Variant styles
  heading1: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.fontSize.xxxl * 1.2,
  },
  heading2: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.fontSize.xxl * 1.3,
  },
  heading3: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.fontSize.xl * 1.3,
  },
  body: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.normal,
    lineHeight: Typography.fontSize.base * 1.5,
  },
  bodyLarge: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.normal,
    lineHeight: Typography.fontSize.lg * 1.5,
  },
  bodySmall: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.normal,
    lineHeight: Typography.fontSize.sm * 1.5,
  },
  caption: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.normal,
    lineHeight: Typography.fontSize.xs * 1.4,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: Typography.fontSize.sm * 1.4,
  },
  // Weight styles
  weight_normal: {
    fontWeight: Typography.fontWeight.normal,
  },
  weight_medium: {
    fontWeight: Typography.fontWeight.medium,
  },
  weight_semibold: {
    fontWeight: Typography.fontWeight.semibold,
  },
  weight_bold: {
    fontWeight: Typography.fontWeight.bold,
  },
  // Color styles
  color_primary: {
    color: Colors.text,
  },
  color_secondary: {
    color: Colors.textSecondary,
  },
  color_tertiary: {
    color: Colors.textTertiary,
  },
  color_inverse: {
    color: Colors.textInverse,
  },
  color_success: {
    color: Colors.success,
  },
  color_error: {
    color: Colors.error,
  },
  color_warning: {
    color: Colors.warning,
  },
  color_info: {
    color: Colors.info,
  },
});
