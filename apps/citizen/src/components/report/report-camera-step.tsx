import React, { useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Camera, X } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Colors, Spacing, Typography } from "@/constants/design-tokens";

interface ReportCameraStepProps {
  onPhotoTaken: (uri: string) => void;
  onSkip: () => void;
}

export const ReportCameraStep: React.FC<ReportCameraStepProps> = ({ onPhotoTaken, onSkip }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        alert("Se necesita permiso para acceder a la cámara.");
        return;
      }
    }
    setShowCamera(true);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo) {
        onPhotoTaken(photo.uri);
        setShowCamera(false);
      }
    }
  };

  if (showCamera) {
    return (
      <CameraView style={StyleSheet.absoluteFill} facing="back" ref={cameraRef}>
        <View style={styles.cameraOverlay}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowCamera(false)}>
            <X color={Colors.textInverse} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture} />
        </View>
      </CameraView>
    );
  }

  return (
    <View style={styles.container}>
      <Camera size={64} color={Colors.textTertiary} />
      <Text style={styles.title}>Añadir una foto</Text>
      <Text style={styles.subtitle}>Una imagen ayuda a resolver el problema más rápido.</Text>
      <Button title="Abrir Cámara" onPress={handleOpenCamera} />
      <Button
        title="Omitir"
        variant="secondary"
        onPress={onSkip}
        style={{ marginTop: Spacing.md }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "space-between",
    padding: Spacing.xxxl,
  },
  closeButton: {
    alignSelf: "flex-start",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.textInverse,
    alignSelf: "center",
  },
});
