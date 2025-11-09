import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AnimatedCard } from '@/components/ui/animated-card';
import { Text } from '@/components/ui/text';
import { BorderRadius, Spacing } from '@/constants/design-tokens';
import { WASTE_TYPES } from '@/constants/waste-types';
import { formatDate } from '@/lib/utils/date-helpers';
import type { Collection } from '@/types';

interface NextCollectionCardProps {
  collection: Collection;
  index?: number;
}

export const NextCollectionCard = React.memo<NextCollectionCardProps>(({ collection, index = 0 }) => {
  const wasteInfo = WASTE_TYPES[collection.type];
  return (
    <AnimatedCard index={index}>
      <View style={styles.header}>
        <Text variant="bodySmall" color="secondary">
          Próxima Recolección
        </Text>
        <View style={styles.badge}>
          <View style={[styles.dot, { backgroundColor: wasteInfo.color }]} />
          <Text variant="label">{wasteInfo.label}</Text>
        </View>
      </View>
      <Text variant="heading3">
        {formatDate(collection.date)} a las {collection.time}
      </Text>
    </AnimatedCard>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.sm,
  },
});

NextCollectionCard.displayName = 'NextCollectionCard';
