import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  className?: string;
  contentClassName?: string;
}

export function Screen({ children, scroll = false, className = '', contentClassName = '' }: ScreenProps) {
  if (scroll) {
    return (
      <SafeAreaView edges={['right', 'left', 'top']} className={`flex-1 bg-background ${className}`}>
        <ScrollView contentContainerStyle={scrollContentStyle} showsVerticalScrollIndicator={false}>
          <View style={defaultPadding} className={`flex-1 ${contentClassName}`}>
            {children}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['right', 'left', 'top']} className={`flex-1 bg-background ${className}`}>
      <View style={defaultPadding} className={`flex-1 ${contentClassName}`}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const defaultPadding = {
  paddingHorizontal: 24,
  paddingTop: 24,
};

const scrollContentStyle = {
  flexGrow: 1,
};
