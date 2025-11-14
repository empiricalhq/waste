import type { ReactNode } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type ViewProps,
} from "react-native";
import { type Edges, SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/theme";

interface ScreenProps extends ViewProps {
  children: ReactNode;
  scrollable?: boolean;
  edges?: Edges;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export function Screen({
  children,
  scrollable = true,
  edges = ["top"],
  isRefreshing,
  onRefresh,
  style,
  ...props
}: ScreenProps) {
  const content = scrollable ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={Boolean(isRefreshing)}
            onRefresh={onRefresh}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.nonScrollableContent]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, style]} edges={edges} {...props}>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  nonScrollableContent: {
    flex: 1,
  },
});
