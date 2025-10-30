import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import * as Location from "expo-location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Spacing } from "@/constants/design-tokens";

interface ReportDetailsStepProps {
  imageUri?: string;
  reportType: string;
  isSubmitting: boolean;
  onSubmit: (details: { description: string; location: string }) => void;
}

export const ReportDetailsStep: React.FC<ReportDetailsStepProps> = ({
  imageUri,
  reportType,
  isSubmitting,
  onSubmit,
}) => {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Obteniendo ubicación...");

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocation("Permiso de ubicación denegado");
        return;
      }
      try {
        let loc = await Location.getCurrentPositionAsync({});
        const addresses = await Location.reverseGeocodeAsync(loc.coords);
        if (addresses.length > 0) {
          const { street, streetNumber, city } = addresses[0];
          setLocation(`${street || ""} ${streetNumber || ""}, ${city || ""}`);
        }
      } catch (error) {
        console.error("Error getting location:", error);
        setLocation("No se pudo obtener la ubicación");
      }
    })();
  }, []);

  const handleSubmit = () => {
    onSubmit({ description, location });
  };

  return (
    <View style={styles.container}>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      <Card style={styles.card}>
        <Input label="Tipo de Reporte" value={reportType} editable={false} />
        <Input label="Ubicación" value={location} editable={false} />
        <Input
          label="Descripción"
          placeholder="Añade más detalles..."
          value={description}
          onChangeText={setDescription}
          multiline
          style={{ height: 100 }}
        />
      </Card>
      <Button
        title="Enviar Reporte"
        onPress={handleSubmit}
        loading={isSubmitting}
        disabled={!description.trim()}
        style={{ marginTop: Spacing.lg }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: Spacing.lg,
  },
  card: {
    gap: Spacing.md,
  },
});
