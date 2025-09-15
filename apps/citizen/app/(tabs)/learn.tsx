import { Text, View } from 'react-native';
import { EducationCard, Screen } from '@/components/ui';

const RECYCLING_CATEGORIES = [
  {
    title: 'Orgánicos',
    description: 'Restos de comida, cáscaras, y residuos de jardín.',
  },
  {
    title: 'Papel y Cartón',
    description: 'Cajas, periódicos, revistas. Limpios y secos.',
  },
  {
    title: 'Plásticos',
    description: 'Botellas, envases y tapas. Enjuagados.',
  },
  {
    title: 'Vidrio',
    description: 'Botellas y frascos de cualquier color. Sin tapas.',
  },
  {
    title: 'Metales',
    description: 'Latas de aluminio y acero.',
  },
] as const;

export default function LearnScreen() {
  return (
    <Screen scroll={true}>
      <Text className="mb-6 text-3xl font-bold text-gray-900">Aprende a Reciclar</Text>
      <View className="space-y-4">
        {RECYCLING_CATEGORIES.map((category, index) => (
          <EducationCard key={index} title={category.title} description={category.description} />
        ))}
      </View>
    </Screen>
  );
}
