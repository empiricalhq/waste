import { useRouter } from "expo-router";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonTruckCard } from "@/components/ui/skeleton";
import { TruckCard } from "@/features/trucks/components/truck-card";
import { useTruckStatus } from "@/features/trucks/hooks/use-truck-status";
import { theme } from "@/theme";

export default function HomeScreen() {
  const router = useRouter();
  const {
    data: status,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useTruckStatus();

  const animatedStyle = useAnimatedStyle(() => {
    const isVisible = !!status && !isLoading;
    return {
      opacity: withTiming(isVisible ? 1 : 0, {
        duration: theme.animation.duration.slow,
      }),
      transform: [
        {
          translateY: withSpring(isVisible ? 0 : 20, theme.animation.easing.spring),
        },
      ],
    };
  }, [status, isLoading]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        <Text style={styles.title}>Inicio</Text>

        {isLoading ? (
          <SkeletonTruckCard />
        ) : error ? (
          <View style={styles.errorContainer}>
            <ErrorState
              message="Error al cargar información"
              onRetry={refetch}
            />
          </View>
        ) : (
          <Animated.View style={[styles.contentWrapper, animatedStyle]}>
            {status && <TruckCard status={status} />}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reportar problema</Text>
              <Text style={styles.sectionDescription}>
                Informa sobre recolecciones perdidas o problemas con la basura
                en tu zona
              </Text>
              <Button
                title="Crear reporte"
                onPress={() => router.push("/report")}
                variant="secondary"
                fullWidth={true}
              />
            </View>
          </Animated.View>
        )}
      </ScrollView>
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
    padding: theme.spacing.lg,
  },
  contentWrapper: {
    gap: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  errorContainer: {
    paddingVertical: theme.spacing.xxl,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  sectionDescription: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
});
