import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { REPORT_TYPES } from "@/constants";
import { useToast } from "@/context/ToastContext";
import { useLocation } from "@/hooks/use-location";
import { theme } from "@/theme";
import type { CreateReportInput } from "@/types";

interface ReportFormProps {
  onSubmit: (data: CreateReportInput) => void;
  isSubmitting: boolean;
}

export function ReportForm({ onSubmit, isSubmitting }: ReportFormProps) {
  const [type, setType] = useState<CreateReportInput["type"] | null>(null);
  const [description, setDescription] = useState("");
  const { coords, isLoading, error, requestLocation } = useLocation();
  const { show } = useToast();

  const handleSubmit = async () => {
    if (!(type && description.trim())) {
      show("Completa todos los campos", {
        type: "error",
        position: "bottom",
      });
      return;
    }

    let location = coords;
    if (!location) {
      try {
        location = await requestLocation();
      } catch {
        show("Se necesita la ubicación para enviar el reporte", {
          type: "error",
          position: "bottom",
          action: {
            label: "Reintentar",
            onPress: requestLocation,
          },
        });
        return;
      }
    }

    onSubmit({
      type,
      description: description.trim(),
      latitude: location.latitude,
      longitude: location.longitude,
    });
  };

  if (!type) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Tipo de reporte</Text>
        <View style={styles.types}>
          {(
            Object.entries(REPORT_TYPES) as [
              CreateReportInput["type"],
              string,
            ][]
          ).map(([key, label]) => (
            <Button
              key={key}
              title={label}
              variant="secondary"
              onPress={() => setType(key)}
              fullWidth={true}
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalles del reporte</Text>

      <Input label="Tipo" value={REPORT_TYPES[type]} editable={false} />

      <Input
        label="Descripción"
        value={description}
        onChangeText={setDescription}
        placeholder="Describe el problema..."
        multiline={true}
        style={styles.textArea}
      />

      <View>
        <Button
          title={coords ? "Ubicación obtenida" : "Obtener ubicación"}
          variant={coords ? "secondary" : "primary"}
          onPress={requestLocation}
          loading={isLoading}
          disabled={isLoading || Boolean(coords)}
          fullWidth={true}
        />
        {error && <Text style={styles.error}>{error}</Text>}
        {coords && (
          <Text style={styles.success}>
            Coordenadas: {coords.latitude.toFixed(6)},{" "}
            {coords.longitude.toFixed(6)}
          </Text>
        )}
      </View>

      <Button
        title="Enviar reporte"
        onPress={handleSubmit}
        loading={isSubmitting}
        disabled={!(description.trim() && (coords || isLoading))}
        fullWidth={true}
      />

      <Button
        title="Cambiar tipo"
        variant="ghost"
        onPress={() => setType(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  types: {
    gap: theme.spacing.md,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  error: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  success: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.success,
    marginTop: theme.spacing.xs,
  },
});
