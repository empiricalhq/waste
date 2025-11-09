import type React from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/design-tokens';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, ...props }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, Boolean(error) && styles.inputError]}
        placeholderTextColor={Colors.textTertiary}
        accessible={true}
        accessibilityLabel={label}
        accessibilityHint={props.placeholder}
        accessibilityState={{ disabled: props.editable === false }}
        {...props}
      />
      {error && (
        <Text style={styles.errorText} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    minHeight: 44, // Ensure adequate touch target
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
});
