import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, Alert } from "react-native";
import { useReportTypes, useSubmitReport } from "@/hooks/use-reports";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useNetwork } from "@/hooks/use-network";
import { theme } from "@/theme";
import { TouchableOpacity } from "react-native-gesture-handler";

export default function ReportScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState<"type" | "details" | "success">("type");
  const [selectedType, setSelectedType] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  
  const { data: types = [], isLoading, error, refetch } = useReportTypes();
  const { mutate: submit, isPending } = useSubmitReport();
  const { isOffline } = useNetwork();

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

  if (isLoading) return <Loading />;
  
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
      <View style={styles.centerContainer}>
        <Text style={styles.successTitle}>✓ Reporte enviado</Text>
        <Text style={styles.successMessage}>
          {isOffline 
            ? "Se enviará cuando recuperes la conexión"
            : "Gracias por tu colaboración"}
        </Text>
        <Button
          title="Crear otro reporte"
          onPress={() => {
            setStep("type");
            setSelectedType("");
            setDescription("");
            setLocation("");
          }}
        />
      </View>
    );
  }

  if (step === "details") {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Detalles del reporte</Text>
        
        {isOffline && (
          <Card style={styles.offlineNotice}>
            <Text style={styles.offlineText}>
              📱 Sin conexión. Se enviará automáticamente cuando vuelvas a estar en línea
            </Text>
          </Card>
        )}

        <Input
          label="Tipo"
          value={selectedType}
          editable={false}
        />
        
        <Input
          label="Ubicación"
          value={location}
          onChangeText={setLocation}
          placeholder="Calle y número"
        />
        
        <Input
          label="Descripción"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe el problema..."
          multiline
          style={{ height: 100, textAlignVertical: "top" }}
        />
        
        <Button
          title="Enviar reporte"
          onPress={() => {
            submit(
              { type: selectedType, description, location },
              {
                onSuccess: () => setStep("success"),
                onError: (error: any) => {
                  if (error.code === "NETWORK_ERROR") {
                    setStep("success");
                  } else {
                    Alert.alert("Error", error.message);
                  }
                },
              }
            );
          }}
          loading={isPending}
          disabled={!description.trim() || !location.trim()}
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Selecciona un problema</Text>
      <FlatList
        data={types}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setSelectedType(item.label);
              setStep("details");
            }}
          >
            <Card style={styles.typeCard}>
              <Text style={styles.typeText}>{item.label}</Text>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
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
});
