import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';

import '../styles/global.css';

const DEBUG_MODE = true;

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <View style={[styles.container, DEBUG_MODE && styles.debug]}>
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="dark" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  debug: {
    backgroundColor: 'rgba(0, 128, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
});
