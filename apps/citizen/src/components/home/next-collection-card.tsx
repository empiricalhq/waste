import type React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedCard } from '@/components/ui/animated-card';
import { Colors, Spacing, Typography } from '@/constants/design-tokens';
import { WASTE_TYPES } from '@/constants/waste-types';
import { formatDate } from '@/lib/utils/date-helpers';
import type { Collection } from '@/types';

interface NextCollectionCardProps {
  collection: Collection;
  index?: number;
}

export const NextCollectionCard: React.FC<NextCollectionCardProps> = ({ collection, index = 0 }) => {
  const wasteInfo = WASTE_TYPES[collection.type];
  return (
    <AnimatedCard index={index}>
      <View style={styles.header}>
        <Text style={styles.label}>Próxima Recolección</Text>
        <View style={styles.badge}>
          <View style={[styles.dot, { backgroundColor: wasteInfo.color }]} />
          <Text style={styles.badgeText}>{wasteInfo.label}</Text>
        </View>
      </View>
      <Text style={styles.date}>
        {formatDate(collection.date)} a las {collection.time}
      </Text>
    </AnimatedCard>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  date: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
  },
});
