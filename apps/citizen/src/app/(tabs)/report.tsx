import { useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/Loading";
import { useLocation } from "@/hooks/use-location";
import { useNetwork } from "@/hooks/use-network";
import { useReportTypes, useSubmitReport } from "@/hooks/use-reports";
import { useAuth } from "@/lib/auth";
import { theme } from "@/theme";

function LoggedOutView() {
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

function SuccessView({
  onCreateAnother,
  isOffline,
}: {
  onCreateAnother: () => void;
  isOffline: boolean;
}) {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.successTitle}>✓ Reporte enviado</Text>
      <Text style={styles.successMessage}>
        {isOffline
          ? "Se enviará cuando recuperes la conexión"
          : "Gracias por tu colaboración"}
      </Text>
      <Button title="Crear otro reporte" onPress={onCreateAnother} />
    </View>
  );
}

function TypeListView({
  types,
  onSelect,
}: {
  types: Array<{ id: string; label: string }>;
  onSelect: (label: string) => void;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Selecciona un problema</Text>
      <FlatList
        data={types}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              onSelect(item.label);
            }}
          >
            <Card style={styles.typeCard}>
              <Text style={styles.typeText}>{item.label}</Text>
            </Card>
          </Pressable>
        )}
      />
    </View>
  );
}

function DetailsView({
  selectedType,
  description,
  address,
  setDescription,
  setAddress,
  coords,
  isLoadingLocation,
  locationError,
  requestLocation,
  submit,
  setStep,
  isPending,
  isOffline,
}: {
  selectedType: string;
  description: string;
  address: string;
  setDescription: (s: string) => void;
  setAddress: (s: string) => void;
  coords: { latitude: number; longitude: number } | null;
  isLoadingLocation: boolean;
  locationError: string | null;
  requestLocation: () => Promise<{ latitude: number; longitude: number }>;

  submit: any;
  setStep: (s: "type" | "details" | "success") => void;
  isPending: boolean;
  isOffline: boolean;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Detalles del reporte</Text>

      {isOffline && (
        <Card style={styles.offlineNotice}>
          <Text style={styles.offlineText}>
            📱 Sin conexión. Se enviará automáticamente cuando vuelvas a estar
            en línea
          </Text>
        </Card>
      )}

      <Input label="Tipo" value={selectedType} editable={false} />

      <View style={styles.locationSection}>
        <Input
          label="Dirección (opcional)"
          value={address}
          onChangeText={setAddress}
          placeholder="Calle y número"
          editable={!isLoadingLocation}
        />
        <Button
          title={coords ? "📍 Ubicación obtenida" : "📍 Obtener ubicación"}
          variant={coords ? "secondary" : "primary"}
          onPress={async () => {
            try {
              await requestLocation();
            } catch (error) {
              Alert.alert(
                "Error de ubicación",
                error instanceof Error
                  ? error.message
                  : "No se pudo obtener la ubicación",
              );
            }
          }}
          loading={isLoadingLocation}
          disabled={isLoadingLocation}
          style={styles.locationButton}
        />
        {locationError && (
          <Text style={styles.locationError}>{locationError}</Text>
        )}
        {coords && (
          <Text style={styles.locationSuccess}>
            ✓ Coordenadas: {coords.latitude.toFixed(6)},{" "}
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
        style={{ height: 100, textAlignVertical: "top" }}
      />

      <Button
        title="Enviar reporte"
        onPress={async () => {
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
            } catch (error) {
              Alert.alert(
                "Ubicación requerida",
                error instanceof Error
                  ? error.message
                  : "Se necesita la ubicación para enviar el reporte.",
              );
            }
          }
        }}
        loading={isPending || isLoadingLocation}
        disabled={!description.trim() || (!coords && isLoadingLocation)}
      />

      <Button
        title="Volver"
        variant="secondary"
        onPress={() => setStep("type")}
        style={{ marginTop: theme.spacing.md }}
      />
    </View>
  );
}

export default function ReportScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState<"type" | "details" | "success">("type");
  const [selectedType, setSelectedType] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");

  const { data: types = [], isLoading, error, refetch } = useReportTypes();
  const { mutate: submit, isPending } = useSubmitReport();
  const { isOffline } = useNetwork();
  const {
    coords,
    isLoading: isLoadingLocation,
    error: locationError,
    requestLocation,
    clearLocation,
  } = useLocation();

  if (!user) {
    return <LoggedOutView />;
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
        isOffline={isOffline}
        onCreateAnother={() => {
          setStep("type");
          setSelectedType("");
          setDescription("");
          setAddress("");
          clearLocation();
        }}
      />
    );
  }

  if (step === "details") {
    return (
      <DetailsView
        selectedType={selectedType}
        description={description}
        address={address}
        setDescription={setDescription}
        setAddress={setAddress}
        coords={coords}
        isLoadingLocation={isLoadingLocation}
        locationError={locationError}
        requestLocation={requestLocation}
        submit={submit}
        setStep={setStep}
        isPending={isPending}
        isOffline={isOffline}
      />
    );
  }

  return (
    <TypeListView
      types={types}
      onSelect={(label) => {
        setSelectedType(label);
        setStep("details");
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  header: {
    fontSize: theme.text.xxxl,
    fontWeight: "700",
    marginBottom: theme.spacing.lg,
  },
  authMessage: {
    textAlign: "center",
    color: theme.colors.textSecondary,
  },
  typeCard: {
    marginBottom: theme.spacing.md,
  },
  typeText: {
    fontSize: theme.text.base,
    fontWeight: "600",
  },
  offlineNotice: {
    backgroundColor: theme.colors.info,
    marginBottom: theme.spacing.lg,
  },
  offlineText: {
    color: theme.colors.textInverse,
    fontSize: theme.text.sm,
  },
  successTitle: {
    fontSize: theme.text.xxxl,
    fontWeight: "700",
  },
  successMessage: {
    fontSize: theme.text.base,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  locationSection: {
    marginBottom: theme.spacing.md,
  },
  locationButton: {
    marginTop: theme.spacing.sm,
  },
  locationError: {
    color: theme.colors.error,
    fontSize: theme.text.sm,
    marginTop: theme.spacing.xs,
  },
  locationSuccess: {
    color: theme.colors.success,
    fontSize: theme.text.sm,
    marginTop: theme.spacing.xs,
  },
});
