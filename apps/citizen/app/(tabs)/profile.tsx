import { Text, View } from 'react-native';
import { Screen } from '@/components/ui';

export default function ProfileScreen() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-gray-900">Perfil del ciudadano</Text>
        <Text className="mt-4 text-center leading-6 text-gray-600">
          Configuración de notificaciones y ubicación próximamente.
        </Text>
      </View>
    </Screen>
  );
}
