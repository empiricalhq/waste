import { Calendar, Map, MessageSquare } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/design-tokens';

interface QuickActionsProps {
  onSchedulePress: () => void;
  onMapPress: () => void;
  onHelpPress: () => void;
}

export const QuickActions = React.memo<QuickActionsProps>(({ onSchedulePress, onMapPress, onHelpPress }) => {
  return (
    <View>
      <Text style={styles.title}>Acciones Rápidas</Text>
      <View style={styles.grid}>
        <ActionButton icon={<Calendar color={Colors.text} />} text="Calendario" onPress={onSchedulePress} />
        <ActionButton icon={<Map color={Colors.text} />} text="Ver Mapa" onPress={onMapPress} />
        <ActionButton icon={<MessageSquare color={Colors.text} />} text="Ayuda" onPress={onHelpPress} />
      </View>
    </View>
  );
});

const ActionButton = ({ icon, text, onPress }: { icon: React.ReactNode; text: string; onPress: () => void }) => (
  <TouchableOpacity
    style={styles.actionButton}
    onPress={onPress}
    accessible={true}
    accessibilityRole="button"
    accessibilityLabel={text}
  >
    {icon}
    <Text style={styles.actionText}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  grid: {
    gap: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
    minHeight: 56, // we have to make sure we have an adequate touch target
  },
  actionText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text,
  },
});

QuickActions.displayName = 'QuickActions';
