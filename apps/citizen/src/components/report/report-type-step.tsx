import type React from 'react';
import { useCallback } from 'react';
import { FlatList, type ListRenderItem, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/card';
import { Colors, Spacing, Typography } from '@/constants/design-tokens';
import type { ReportType } from '@/types';

interface ReportTypeStepProps {
  reportTypes: ReportType[];
  onSelectType: (type: string) => void;
}

export const ReportTypeStep: React.FC<ReportTypeStepProps> = ({ reportTypes, onSelectType }) => {
  const renderItem: ListRenderItem<ReportType> = useCallback(
    ({ item }) => (
      <TouchableOpacity onPress={() => onSelectType(item.label)}>
        <Card style={styles.card}>
          <Text style={styles.typeText}>{item.label}</Text>
        </Card>
      </TouchableOpacity>
    ),
    [onSelectType],
  );

  return (
    <FlatList
      data={reportTypes}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      ListHeaderComponent={<Text style={styles.title}>Selecciona un tipo de problema</Text>}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  card: {
    padding: Spacing.lg,
  },
  typeText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text,
  },
});
