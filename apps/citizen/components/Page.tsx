import { SafeAreaView } from 'react-native-safe-area-context';

type PageProps = {
  children: React.ReactNode;
  className?: string;
};

export function Page({ children, className = '' }: PageProps) {
  return (
    <SafeAreaView className={`${styles.container} ${className}`}>
      {children}
    </SafeAreaView>
  );
}

const styles = {
  container: 'flex-1 bg-background',
};
