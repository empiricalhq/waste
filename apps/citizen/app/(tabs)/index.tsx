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

  function renderContent() {
    switch (status) {
      case 'LOADING':
        return (
          <View className="flex-1 justify-center items-center">
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
            <Text className="text-lg text-secondary">
              El próximo recojo es: {nextCollectionDay}
            </Text>
            <Text className="text-xl font-bold text-text pt-4">
              Mientras tanto, ¡aprendamos a reciclar!
            </Text>
            <EducationCard
              title="Clasifica tus residuos"
              description="Aprende la diferencia entre orgánico, reciclable y no aprovechable."
            />
          </>
        );
      case 'ERROR':
        return <Text className="text-red-500">Error al cargar los datos.</Text>;
    }
  }

  return (
    <Page>
      <View className="space-y-6">
        <View>
          <Text className="text-3xl font-bold text-text">Bienvenido,</Text>
          <Text className="text-lg text-secondary">Tu gestor de residuos inteligente.</Text>
        </View>
        {renderContent()}
      </View>
    </Page>
  );
}
