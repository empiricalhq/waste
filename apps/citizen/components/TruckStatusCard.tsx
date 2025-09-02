import { Text, TouchableOpacity, View } from 'react-native';

type TruckStatusCardProps = {
  status: 'NEARBY' | 'ON_THE_WAY';
  etaMinutes: number;
  onMapPress: () => void;
};

export function TruckStatusCard({ status, etaMinutes, onMapPress }: TruckStatusCardProps) {
  const statusMessage = status === 'NEARBY' ? '¡El camión está cerca!' : 'El camión está en camino';

  return (
    <View className={styles.container}>
      <Text className={styles.statusText}>{statusMessage}</Text>
      <View className={styles.etaContainer}>
        <Text className={styles.etaText}>{etaMinutes}</Text>
        <Text className={styles.etaLabel}>minutos aprox.</Text>
      </View>
      <TouchableOpacity activeOpacity={0.7} onPress={onMapPress} className={styles.mapButton}>
        <Text className={styles.mapButtonText}>Ver en el mapa</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  container: `bg-white p-6 rounded-2xl shadow-md space-y-4`,
  statusText: `text-xl font-bold text-primary`,
  etaContainer: 'items-center',
  etaText: `text-4xl font-extrabold text-text`,
  etaLabel: `text-base text-secondary`,
  mapButton: `bg-primary py-3 rounded-lg mt-4`,
  mapButtonText: `text-white text-center font-bold text-base`,
};
