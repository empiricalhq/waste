import { Text, View } from 'react-native';
import { Page } from '@/components/Page';

export default function ProfileScreen() {
  return (
    <Page>
      <View className={styles.container}>
        <Text className={styles.header}>Perfil del Ciudadano</Text>
        <Text className={styles.subHeader}>
          Configuración de notificaciones y ubicación próximamente.
        </Text>
      </View>
    </Page>
  );
}

const styles = {
  container: 'flex-1 justify-center items-center p-6',
  header: 'text-2xl font-bold text-text',
  subHeader: 'text-secondary mt-2 text-center',
};
