import { CameraView, useCameraPermissions } from "expo-camera";
import { Camera, X } from "lucide-react-native";
import type React from "react";
import { useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Modal } from "@/components/ui/modal";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/constants/design-tokens";

interface ReportCameraStepProps {
  onPhotoTaken: (uri: string) => void;
  onSkip: () => void;
}

export const ReportCameraStep: React.FC<ReportCameraStepProps> = ({
  onPhotoTaken,
  onSkip,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [showPermissionDeniedModal, setShowPermissionDeniedModal] =
    useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      setIsRequestingPermission(true);
      const { granted } = await requestPermission();
      setIsRequestingPermission(false);

      if (!granted) {
        setShowPermissionDeniedModal(true);
        return;
      }
    }
    setIsCameraReady(false);
    setShowCamera(true);
  };

  const handleCameraReady = () => {
    setIsCameraReady(true);
  };

  const takePicture = async () => {
    if (cameraRef.current && !isTakingPhoto) {
      setIsTakingPhoto(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: false,
        });
        if (photo) {
          onPhotoTaken(photo.uri);
          setShowCamera(false);
        }
      } catch (error) {
        console.error("Error taking picture:", error);
      } finally {
        setIsTakingPhoto(false);
      }
    }
  };

  if (showCamera) {
    return (
      <View
        style={StyleSheet.absoluteFill}
        accessible={true}
        accessibilityLabel="Vista de cámara"
        accessibilityHint="La cámara está activa. Usa el botón de captura para tomar una foto o el botón de cerrar para salir"
      >
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          ref={cameraRef}
          ratio="16:9"
          onCameraReady={handleCameraReady}
          enableTorch={false}
          animateShutter={true}
        >
          {!isCameraReady && (
            <View style={styles.cameraLoadingOverlay}>
              <LoadingSpinner />
              <Text style={styles.cameraLoadingText}>Iniciando cámara...</Text>
            </View>
          )}

          <View style={styles.cameraOverlay}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCamera(false)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cerrar cámara"
              accessibilityHint="Cierra la cámara y regresa a la pantalla anterior"
              disabled={isTakingPhoto}
            >
              <X color={Colors.textInverse} size={32} />
            </TouchableOpacity>

            <View style={styles.captureContainer}>
              {isTakingPhoto ? (
                <View
                  style={styles.captureLoadingContainer}
                  accessible={true}
                  accessibilityLabel="Procesando foto"
                  accessibilityHint="Por favor espera mientras se procesa la foto"
                >
                  <LoadingSpinner />
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={takePicture}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Tomar foto"
                  accessibilityHint="Captura una foto del problema que deseas reportar"
                  disabled={!isCameraReady}
                >
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        size={64}
        color={Colors.textTertiary}
        accessibilityLabel="Icono de cámara"
      />
      <Text style={styles.title} accessible={true} accessibilityRole="header">
        Añadir una foto
      </Text>
      <Text style={styles.subtitle}>
        Una imagen ayuda a resolver el problema más rápido.
      </Text>

      {isRequestingPermission ? (
        <View
          accessible={true}
          accessibilityLabel="Solicitando permiso de cámara"
          accessibilityHint="Por favor espera mientras se solicita el permiso"
        >
          <LoadingSpinner />
        </View>
      ) : (
        <>
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
        </>
      )}

      <Modal
        visible={showPermissionDeniedModal}
        onClose={() => setShowPermissionDeniedModal(false)}
        title="Permiso de cámara necesario"
        message="Para tomar fotos del problema, necesitamos acceso a tu cámara. Por favor, habilita el permiso en la configuración de tu dispositivo."
        primaryAction={{
          label: "Entendido",
          onPress: () => setShowPermissionDeniedModal(false),
        }}
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
  cameraLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.lg,
  },
  cameraLoadingText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textInverse,
    fontWeight: Typography.fontWeight.medium,
  },
  closeButton: {
    alignSelf: "flex-start",
    padding: Spacing.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  captureContainer: {
    alignItems: "center",
    marginBottom: Spacing.xxxl,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.textInverse,
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
  },
  captureButtonInner: {
    width: 58,
    height: 58,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.textInverse,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  captureLoadingContainer: {
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
});
