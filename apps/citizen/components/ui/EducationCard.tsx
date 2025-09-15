import { Image, Text, TouchableOpacity, View } from 'react-native';

type EducationCardProps = {
  title: string;
  description: string;
  onPress?: () => void;
};

export function EducationCard({ title, description, onPress }: EducationCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <View className={styles.container}>
        <Image source={require('@/assets/favicon.png')} className={styles.image} />
        <View className={styles.textContainer}>
          <Text className={styles.title}>{title}</Text>
          <Text className={styles.description}>{description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = {
  container: 'bg-white rounded-2xl shadow-sm overflow-hidden flex-row mt-4',
  image: 'w-24 h-24',
  textContainer: 'p-4 flex-1 justify-center',
  title: 'text-base font-bold text-text',
  description: 'text-sm text-secondary mt-1',
};
