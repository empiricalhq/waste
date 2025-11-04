import { WifiOff } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/design-tokens';

export const OfflineBanner = () => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { bottom: insets.bottom || Spacing.md }]}>
      <WifiOff size={16} color={Colors.textInverse} />
      <Text style={styles.text}>Estás sin conexión</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.text,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  text: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
});
