import { Text, View } from 'react-native';
import { Page } from '@/components/Page';

export default function ProfileScreen() {
  return (
    <Page>
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-text">Perfil del ciudadano</Text>
        <Text className="mt-2 text-center text-secondary">
          Configuración de notificaciones y ubicación próximamente.
        </Text>
      </View>
    </Page>
  );
}
