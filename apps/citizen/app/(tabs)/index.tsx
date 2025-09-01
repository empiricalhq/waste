import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { Page } from '@/components/Page';
import { TruckStatusCard } from '@/components/TruckStatusCard';
import { EducationCard } from '@/components/EducationCard';
import { useTruckStore } from '@/lib/store';

export default function HomeScreen() {
  const { status, etaMinutes, nextCollectionDay, fetchTruckStatus } = useTruckStore();

  useEffect(() => {
    fetchTruckStatus('citizen-1');
  }, []);

  const renderContent = () => {
    switch (status) {
      case 'LOADING':
        return (
          <View className={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
          </View>
        );
      case 'NEARBY':
      case 'ON_THE_WAY':
        return (
          <TruckStatusCard
            status={status}
            etaMinutes={etaMinutes!}
            onMapPress={() => console.log('Navigate to map view')}
          />
        );
      case 'NOT_SCHEDULED':
        return (
          <>
            <Text className={styles.subHeader}>
              El próximo recojo es: {nextCollectionDay}
            </Text>
            <Text className={styles.educationTitle}>
              Mientras tanto, ¡aprendamos a reciclar!
            </Text>
            <EducationCard
              title="Clasifica tus residuos"
              description="Aprende la diferencia entre orgánico, reciclable y no aprovechable."
            />
          </>
        );
      case 'ERROR':
        return <Text className={styles.errorText}>Error al cargar los datos.</Text>;
    }
  };

  return (
    <Page>
      <View className={styles.container}>
        <View>
          <Text className={styles.header}>Bienvenido,</Text>
          <Text className={styles.subHeader}>Tu gestor de residuos inteligente.</Text>
        </View>
        {renderContent()}
      </View>
    </Page>
  );
}

const styles = {
  container: `p-6 space-y-6`,
  header: `text-3xl font-bold text-text`,
  subHeader: `text-lg text-secondary`,
  educationTitle: `text-xl font-bold text-text pt-4`,
  loadingContainer: `flex-1 justify-center items-center`,
  errorText: 'text-red-500',
};
