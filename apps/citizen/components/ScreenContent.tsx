import { Text, View } from 'react-native';


type ScreenContentProps = {
  title: string;
  path: string;
  children?: React.ReactNode;
};

export const ScreenContent = ({ title, path, children }: ScreenContentProps) => {
  return (
    <View className={styles.container}>
      <Text className={styles.title}>{title}</Text>
    </View>
  );
};

const styles = {
  container: `items-center flex-1 justify-center bg-green-200`,
  title: `text-xl font-bold`,
};
