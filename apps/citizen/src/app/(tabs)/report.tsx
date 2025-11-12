import { memo, useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Input } from "@/components/ui/Input";
import { Loading } from "@/components/ui/Loading";
import { useReportTypes, useSubmitReport } from "@/hooks/queries";
import { useLocation } from "@/hooks/use-location";
import { useNetwork } from "@/hooks/use-network";
import { useAuth } from "@/lib/auth";
import { theme } from "@/theme";

type Step = "type" | "details" | "success";

const TypeSelector = memo<{
  types: Array<{ id: string; label: string }>;
  onSelect: (label: string) => void;
}>(({ types, onSelect }) => (
  <View style={styles.container}>
    <Text style={styles.header}>Tipo de reporte</Text>
    <FlatList
      data={types}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Pressable onPress={() => onSelect(item.label)}>
          <Card style={styles.typeCard}>
            <Text style={styles.typeText}>{item.label}</Text>
          </Card>
        </Pressable>
      )}
    />
  </View>
));

TypeSelector.displayName = "TypeSelector";

const ReportForm = memo<{
  selectedType: string;
  description: string;
  setDescription: (s: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  isOffline: boolean;
}>(
  ({
    selectedType,
    description,
    setDescription,
    onSubmit,
    onBack,
    isSubmitting,
    isOffline,
  }) => {
    const {
      coords,
      isLoading: isLoadingLocation,
      error,
      requestLocation,
    } = useLocation();

    const handleLocationRequest = useCallback(async () => {
      try {
        await requestLocation();
      } catch (err) {
        Alert.alert(
          "Error",
          err instanceof Error
            ? err.message
            : "No se pudo obtener la ubicación",
        );
      }
    }, [requestLocation]);

    return (
      <View style={styles.container}>
        <Text style={styles.header}>Detalles del reporte</Text>

        {isOffline && (
          <Card style={styles.offlineCard}>
            <Text style={styles.offlineText}>
              Sin conexión. El reporte se enviará automáticamente al recuperar
              la conexión.
            </Text>
          </Card>
        )}

        <Input
          label="Tipo"
          value={selectedType}
          editable={false}
          containerStyle={styles.input}
        />

        <View style={styles.locationSection}>
          <Button
            title={coords ? "Ubicación obtenida" : "Obtener ubicación"}
            variant={coords ? "secondary" : "primary"}
            onPress={handleLocationRequest}
            loading={isLoadingLocation}
            disabled={isLoadingLocation}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
          {coords && (
            <Text style={styles.successText}>
              Coordenadas: {coords.latitude.toFixed(6)},{" "}
              {coords.longitude.toFixed(6)}
            </Text>
          )}
        </View>

        <Input
          label="Descripción"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe el problema..."
          multiline={true}
          style={styles.textArea}
          containerStyle={styles.input}
        />

        <Button
          title="Enviar reporte"
          onPress={onSubmit}
          loading={isSubmitting || isLoadingLocation}
          disabled={!(description.trim() && (coords || isLoadingLocation))}
          fullWidth={true}
        />

        <Button
          title="Volver"
          variant="ghost"
          onPress={onBack}
          style={styles.backButton}
        />
      </View>
    );
  },
);

ReportForm.displayName = "ReportForm";

const SuccessView = memo<{
  onCreateAnother: () => void;
  isOffline: boolean;
}>(({ onCreateAnother, isOffline }) => (
  <View style={styles.centerContainer}>
    <View style={styles.successIcon}>
      <Text style={styles.checkmark}>✓</Text>
    </View>
    <Text style={styles.successTitle}>Reporte enviado</Text>
    <Text style={styles.successMessage}>
      {isOffline
        ? "Se enviará cuando recuperes la conexión"
        : "Gracias por tu colaboración"}
    </Text>
    <Button title="Crear otro reporte" onPress={onCreateAnother} />
  </View>
));

SuccessView.displayName = "SuccessView";

export default memo(function ReportScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("type");
  const [selectedType, setSelectedType] = useState("");
  const [description, setDescription] = useState("");

  const { data: types = [], isLoading, error, refetch } = useReportTypes();
  const { mutate: submit, isPending } = useSubmitReport();
  const { isOffline } = useNetwork();
  const { coords, requestLocation, clearLocation } = useLocation();

  const handleTypeSelect = useCallback((label: string) => {
    setSelectedType(label);
    setStep("details");
  }, []);

  const handleSubmit = useCallback(async () => {
    const submitReport = (locationCoords: {
      latitude: number;
      longitude: number;
    }) => {
      submit(
        {
          type: selectedType,
          description,
          latitude: locationCoords.latitude,
          longitude: locationCoords.longitude,
        },
        {
          onSuccess: () => setStep("success"),
          onError: (error: any) => {
            if (error.code === "NETWORK_ERROR") {
              setStep("success");
            } else {
              Alert.alert("Error", error.message);
            }
          },
        },
      );
    };

    if (coords) {
      submitReport(coords);
    } else {
      try {
        const locationCoords = await requestLocation();
        submitReport(locationCoords);
      } catch (err) {
        Alert.alert(
          "Ubicación requerida",
          err instanceof Error
            ? err.message
            : "Se necesita la ubicación para enviar el reporte",
        );
      }
    }
  }, [coords, description, requestLocation, selectedType, submit]);

  const handleCreateAnother = useCallback(() => {
    setStep("type");
    setSelectedType("");
    setDescription("");
    clearLocation();
  }, [clearLocation]);

  const handleBack = useCallback(() => {
    setStep("type");
  }, []);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Reportar</Text>
        <Card>
          <Text style={styles.authMessage}>
            Inicia sesión para enviar reportes
          </Text>
        </Card>
      </View>
    );
  }

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorMessage
        message="Error al cargar tipos de reporte"
        isOffline={isOffline}
        onRetry={refetch}
      />
    );
  }

  if (step === "success") {
    return (
      <SuccessView
        onCreateAnother={handleCreateAnother}
        isOffline={isOffline}
      />
    );
  }

  if (step === "details") {
    return (
      <ReportForm
        selectedType={selectedType}
        description={description}
        setDescription={setDescription}
        onSubmit={handleSubmit}
        onBack={handleBack}
        isSubmitting={isPending}
        isOffline={isOffline}
      />
    );
  }

  return <TypeSelector types={types} onSelect={handleTypeSelect} />;
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  header: {
    fontSize: theme.text.xxxl,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.lg,
    color: theme.colors.text,
  },
  typeCard: {
    marginBottom: theme.spacing.md,
  },
  typeText: {
    fontSize: theme.text.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  input: {
    marginBottom: theme.spacing.lg,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  locationSection: {
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.text.sm,
  },
  successText: {
    color: theme.colors.success,
    fontSize: theme.text.sm,
  },
  offlineCard: {
    backgroundColor: theme.colors.infoLight,
    marginBottom: theme.spacing.lg,
  },
  offlineText: {
    color: theme.colors.info,
    fontSize: theme.text.sm,
  },
  backButton: {
    marginTop: theme.spacing.md,
  },
  authMessage: {
    textAlign: "center",
    color: theme.colors.textSecondary,
    fontSize: theme.text.base,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.successLight,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    fontSize: 48,
    color: theme.colors.success,
  },
  successTitle: {
    fontSize: theme.text.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  successMessage: {
    fontSize: theme.text.base,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});
