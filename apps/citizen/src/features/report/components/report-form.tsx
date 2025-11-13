import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { REPORT_TYPES } from "@/constants";
import { useToast } from "@/context/ToastContext";
import { useLocation } from "@/features/map/hooks/use-location";
import { theme } from "@/theme";
import type { CreateReportInput } from "@/types";

interface ReportFormProps {
  onSubmit: (data: CreateReportInput) => void;
  isSubmitting: boolean;
}

type FormData = Pick<CreateReportInput, "description">;

export function ReportForm({ onSubmit, isSubmitting }: ReportFormProps) {
  const [type, setType] = useState<CreateReportInput["type"] | null>(null);
  const {
    coords,
    isLoading: isLoadingLocation,
    error: locationError,
    requestLocation,
  } = useLocation();
  const { show } = useToast();

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: { description: "" },
  });

  const handleFormSubmit = async (data: FormData) => {
    if (!type) {
      // This should not happen if UI is correct, but as a safeguard
      show("Selecciona un tipo de reporte", { type: "error" });
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
        });
        return;
      }
    }

    onSubmit({
      type,
      description: data.description.trim(),
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

      <Controller
        control={control}
        name="description"
        rules={{
          required: "La descripción es obligatoria",
          minLength: {
            value: 10,
            message:
              "Describe el problema con más detalle (mín. 10 caracteres)",
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Descripción"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Describe el problema..."
            multiline={true}
            style={styles.textArea}
            error={errors.description?.message}
          />
        )}
      />

      <View>
        <Button
          title={coords ? "Ubicación obtenida" : "Obtener ubicación"}
          variant={coords ? "secondary" : "primary"}
          onPress={requestLocation}
          loading={isLoadingLocation}
          disabled={isLoadingLocation || Boolean(coords)}
          fullWidth={true}
        />
        {locationError && <Text style={styles.error}>{locationError}</Text>}
        {coords && (
          <Text style={styles.success}>
            Coordenadas: {coords.latitude.toFixed(6)},{" "}
            {coords.longitude.toFixed(6)}
          </Text>
        )}
      </View>

      <Button
        title="Enviar reporte"
        onPress={handleSubmit(handleFormSubmit)}
        loading={isSubmitting}
        disabled={!isValid || isSubmitting}
        fullWidth={true}
      />

      <Button
        title="Cambiar tipo"
        variant="ghost"
        onPress={() => setType(null)}
        disabled={isSubmitting}
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
