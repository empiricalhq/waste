import { StyleSheet, View, type ViewProps } from 'react-native';
import { theme } from '../../theme';

interface CardProps extends Omit<ViewProps, 'style'> {
  variant?: 'default' | 'elevated';
}

export function Card({ variant = 'default', children, ...props }: CardProps) {
  return (
    <View
      style={[styles.card, variant === 'elevated' && styles.elevated]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  elevated: {
    ...theme.shadow.md,
    borderWidth: 0,
  },
});
