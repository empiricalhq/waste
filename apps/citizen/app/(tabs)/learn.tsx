import { ScrollView, Text, View } from 'react-native';
import { Page } from '@/components/Page';
import { EducationCard } from '@/components/EducationCard';

export default function LearnScreen() {
  return (
    <Page>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text className={styles.header}>Aprende a Reciclar</Text>
        <View className={styles.cardContainer}>
          <EducationCard title="Orgánicos" description="Restos de comida, cáscaras, y residuos de jardín." />
          <EducationCard title="Papel y Cartón" description="Cajas, periódicos, revistas. Limpios y secos." />
          <EducationCard title="Plásticos" description="Botellas, envases y tapas. Enjuagados." />
          <EducationCard title="Vidrio" description="Botellas y frascos de cualquier color. Sin tapas." />
          <EducationCard title="Metales" description="Latas de aluminio y acero." />
        </View>
      </ScrollView>
    </Page>
  );
}

const styles = {
  header: 'text-3xl font-bold text-text mb-4',
  cardContainer: 'space-y-2',
};