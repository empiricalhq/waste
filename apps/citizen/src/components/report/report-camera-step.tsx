import { CameraView, useCameraPermissions } from 'expo-camera';
import { Camera, X } from 'lucide-react-native';
import type React from 'react';
import { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/design-tokens';

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
        alert('Se necesita permiso para acceder a la cámara.');
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
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowCamera(false)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Cerrar cámara"
            accessibilityHint="Cierra la cámara y regresa a la pantalla anterior"
          >
            <X color={Colors.textInverse} size={32} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Tomar foto"
            accessibilityHint="Captura una foto del problema que deseas reportar"
          />
        </View>
      </CameraView>
    );
  }

  return (
    <View style={styles.container}>
      <Camera size={64} color={Colors.textTertiary} />
      <Text style={styles.title}>Añadir una foto</Text>
      <Text style={styles.subtitle}>Una imagen ayuda a resolver el problema más rápido.</Text>
      <Button
        title="Abrir Cámara"
        onPress={handleOpenCamera}
        accessibilityHint="Abre la cámara para tomar una foto del problema"
      />
      <Button
        title="Omitir"
        variant="secondary"
        onPress={onSkip}
        style={{ marginTop: Spacing.md }}
        accessibilityHint="Continúa sin agregar una foto"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    padding: Spacing.xxxl,
  },
  closeButton: {
    alignSelf: 'flex-start',
    padding: Spacing.sm,
    minWidth: 44,
    minHeight: 44,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.textInverse,
    alignSelf: 'center',
    marginBottom: Spacing.xxxl,
  },
});
