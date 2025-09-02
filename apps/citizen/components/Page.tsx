import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View } from 'react-native';

type PageProps = {
  children: React.ReactNode;
  scroll?: boolean;
  noPadding?: boolean;
  contentPadding?: number;
  className?: string;
  contentClassName?: string;
};

const DEFAULT_PADDING = 24; // Tailwind p-6 equivalent

export function Page({
  children,
  scroll = false,
  noPadding = false,
  contentPadding,
  className = '',
  contentClassName = '',
}: PageProps) {
  const pad = noPadding ? 0 : (contentPadding ?? DEFAULT_PADDING);

  const paddingStyle = {
    paddingTop: pad,
    paddingHorizontal: pad,
    paddingBottom: 0,
  };

  if (scroll) {
    return (
      <SafeAreaView className={`flex-1 bg-background ${className}`}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, ...paddingStyle }}>
          <View className={`flex-1 ${contentClassName}`}>{children}</View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 bg-background ${className}`}>
      <View className={`flex-1 ${contentClassName}`} style={paddingStyle}>
        {children}
      </View>
    </SafeAreaView>
  );
}
