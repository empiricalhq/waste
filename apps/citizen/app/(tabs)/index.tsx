import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { EducationCard, Screen, TruckStatusCard } from '@/components/ui';
import { appColors } from '@/constants/colors';
import { useTruckStore } from '@/lib/stores/truck.store';

const USER_ID = 'citizen-1';

export default function HomeScreen() {
  const { status, etaMinutes, nextCollectionDay, fetchTruckStatus } = useTruckStore();

  useEffect(() => {
    fetchTruckStatus(USER_ID);
  }, [fetchTruckStatus]);

  const renderContent = () => {
    switch (status) {
      case 'LOADING':
        return (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={appColors.primary} />
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
          <View className="space-y-4">
            <Text className="text-lg text-gray-600">El próximo recojo es: {nextCollectionDay}</Text>
            <Text className="text-xl font-bold text-gray-900">Mientras tanto, ¡aprendamos a reciclar!</Text>
            <EducationCard
              title="Clasifica tus residuos"
              description="Aprende la diferencia entre orgánico, reciclable y no aprovechable."
            />
          </View>
        );

      case 'ERROR':
        return <Text className="text-red-500">Error al cargar los datos.</Text>;
    }
  };

  return (
    <Screen>
      <View className="space-y-6">
        <View>
          <Text className="text-3xl font-bold text-gray-900">Bienvenido,</Text>
          <Text className="text-lg text-gray-600">Tu gestor de residuos inteligente.</Text>
        </View>
        {renderContent()}
      </View>
    </Screen>
  );
}
