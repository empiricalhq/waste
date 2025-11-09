import { FlatList, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { ErrorState } from '@/components/shared/error-state';
import { Header } from '@/components/shared/header';
import { ListSkeleton } from '@/components/shared/loading-skeleton';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/design-tokens';
import { WASTE_TYPES } from '@/constants/waste-types';
import { useCollections } from '@/features/collections/hooks/use-collections';
import { useNetworkStatus } from '@/lib/hooks/use-network-status';
import { formatFullDate } from '@/lib/utils/date-helpers';
import type { Collection } from '@/types';

export default function ScheduleScreen() {
  const { isOffline } = useNetworkStatus();
  const { data: collections, isLoading, error, refetch, dataUpdatedAt } = useCollections();

  // Check if data is older than 7 days
  const isDataOld = dataUpdatedAt && Date.now() - dataUpdatedAt > 7 * 24 * 60 * 60 * 1000;

  const renderItem = ({ item }: { item: Collection }) => {
    const wasteInfo = WASTE_TYPES[item.type];
    const cardStyle: ViewStyle = item.completed ? { ...styles.card, ...styles.completedCard } : styles.card;
    return (
      <Card style={cardStyle}>
        <View style={styles.cardContent}>
          <View style={[styles.dot, { backgroundColor: wasteInfo.color }]} />
          <View>
            <Text style={styles.typeText}>{wasteInfo.label}</Text>
            <Text style={styles.dateText}>
              {formatFullDate(item.date)} - {item.time}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Calendario de Recolección" />
      {isLoading ? (
        <View style={styles.list}>
          <ListSkeleton count={5} />
        </View>
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} isOffline={isOffline} />
      ) : (
        <>
          {isDataOld && (
            <View style={styles.warningBanner}>
              <Text style={styles.warningText}>⚠️ Los datos tienen más de 7 días. Conéctate para actualizar.</Text>
            </View>
          )}
          {dataUpdatedAt && (
            <View style={styles.timestampBanner}>
              <Text style={styles.timestampText}>
                Última actualización: {new Date(dataUpdatedAt).toLocaleString('es-PE')}
              </Text>
            </View>
          )}
          <FlatList
            data={collections}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<EmptyState title="No hay fechas de recolección disponibles." />}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  card: {
    padding: Spacing.lg,
  },
  completedCard: {
    opacity: 0.6,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.sm,
  },
  typeText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  dateText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  warningBanner: {
    backgroundColor: Colors.warning,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  warningText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
  timestampBanner: {
    padding: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
  },
  timestampText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
  },
});
