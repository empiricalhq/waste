import Colors from "@/constants/colors";
import { addReport, getReports, getReportTypes } from "@/services/api";
import { Report, ReportType } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { Camera, Check, X } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ReportStep = "type" | "camera" | "details" | "success";

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<ReportStep>("type");
  const [selectedType, setSelectedType] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [location, setLocation] = useState("Obteniendo ubicación...");
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const { data: reports = [], isLoading: isLoadingReports } = useQuery<Report[]>({
    queryKey: ["reports"],
    queryFn: getReports,
  });

  const { data: reportTypes = [], isLoading: isLoadingTypes } = useQuery<ReportType[]>({
    queryKey: ["reportTypes"],
    queryFn: getReportTypes,
  });

  const { mutate: submitReport, isPending: isSubmitting } = useMutation({
    mutationFn: addReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setStep("success");
    },
    onError: (error) => {
      Alert.alert("Error", `No se pudo enviar el reporte: ${error.message}`);
    },
  });

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setStep("camera");
  };

  const handleOpenCamera = async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert(
          "Permiso denegado",
          "Necesitamos acceso a la cámara para tomar una foto del incidente."
        );
        return;
      }
    }
    setShowCamera(true);
  };

  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          setImageUri(photo.uri);
          setShowCamera(false);
          setStep("details");
          fetchLocation();
        }
      } catch (error) {
        console.error("Error al tomar foto:", error);
      }
    }
  };

  const handleSkipPhoto = () => {
    setStep("details");
    fetchLocation();
  };

  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        const address = await Location.reverseGeocodeAsync(loc.coords);
        if (address[0]) {
          setLocation(
            `${address[0].street || ""} ${address[0].streetNumber || ""}, ${address[0].city || ""}`.trim()
          );
        } else {
          setLocation("Ubicación actual");
        }
      } else {
        setLocation("Permiso de ubicación denegado");
      }
    } catch (error) {
      console.error("Error al obtener ubicación:", error);
      setLocation("Ubicación actual");
    }
  };

  const handleSubmit = () => {
    submitReport({
      type: selectedType,
      description,
      location,
      imageUri,
    });
  };

  const handleReset = () => {
    setStep("type");
    setSelectedType("");
    setDescription("");
    setImageUri(undefined);
    setLocation("Obteniendo ubicación...");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return Colors.light.textTertiary;
      case "in-progress":
        return Colors.light.textSecondary;
      case "resolved":
        return Colors.light.text;
      default:
        return Colors.light.textSecondary;
    }
  };

  if (step === "type") {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Reportar un problema</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selecciona un tipo</Text>
            {isLoadingTypes ? (
              <ActivityIndicator />
            ) : (
              <View style={styles.typeGrid}>
                {reportTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={styles.typeCard}
                    onPress={() => handleTypeSelect(type.label)}
                    activeOpacity={0.7}>
                    <Text style={styles.typeLabel}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {reports.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reportes recientes</Text>
              {isLoadingReports ? (
                <ActivityIndicator />
              ) : (
                <View style={styles.reportsList}>
                  {reports.slice(0, 3).map((report) => (
                    <View key={report.id} style={styles.reportCard}>
                      <View style={styles.reportHeader}>
                        <Text style={styles.reportType}>{report.type}</Text>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: Colors.light.background },
                          ]}>
                          <Text
                            style={[styles.statusText, { color: getStatusColor(report.status) }]}>
                            {report.status}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.reportDescription} numberOfLines={2}>
                        {report.description}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  if (step === "camera") {
    return (
      <View style={styles.container}>
        <View style={styles.cameraStep}>
          <View style={[styles.stepHeader, { paddingTop: insets.top + 16 }]}>
            <TouchableOpacity onPress={() => setStep("type")}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={styles.stepTitle}>Añadir foto</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.cameraPlaceholder}>
            <Camera size={48} color={Colors.light.textSecondary} />
            <Text style={styles.cameraPlaceholderText}>Toma una foto del problema</Text>
          </View>

          <View style={styles.cameraActions}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleOpenCamera}>
              <Text style={styles.primaryButtonText}>Abrir cámara</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleSkipPhoto}>
              <Text style={styles.secondaryButtonText}>Omitir</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal visible={showCamera} animationType="slide">
          <View style={styles.cameraContainer}>
            <CameraView ref={cameraRef} style={styles.camera} facing="back">
              <View style={styles.cameraOverlay}>
                <TouchableOpacity
                  style={[styles.closeButton, { top: Platform.OS === "ios" ? 60 : 40 }]}
                  onPress={() => setShowCamera(false)}>
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.cameraControls}>
                  <TouchableOpacity style={styles.captureButton} onPress={handleTakePhoto}>
                    <View style={styles.captureButtonInner} />
                  </TouchableOpacity>
                </View>
              </View>
            </CameraView>
          </View>
        </Modal>
      </View>
    );
  }

  if (step === "details") {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.stepHeader, { paddingTop: insets.top + 16 }]}>
            <TouchableOpacity onPress={() => setStep("camera")}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={styles.stepTitle}>Detalles</Text>
            <View style={{ width: 24 }} />
          </View>

          {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tipo</Text>
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyText}>{selectedType}</Text>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Ubicación</Text>
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyText}>{location}</Text>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Describe el problema..."
                placeholderTextColor={Colors.light.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!description || isSubmitting) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!description || isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color={Colors.light.cardBackground} />
              ) : (
                <Text style={styles.submitButtonText}>Enviar</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Check size={48} color={Colors.light.text} />
        </View>
        <Text style={styles.successTitle}>Reporte enviado</Text>
        <Text style={styles.successSubtitle}>
          Investigaremos el problema y te mantendremos informado.
        </Text>
        <TouchableOpacity style={styles.doneButton} onPress={handleReset}>
          <Text style={styles.doneButtonText}>Hecho</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.light.textSecondary,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  typeGrid: {
    gap: 8,
  },
  typeCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  typeLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.light.text,
  },
  reportsList: {
    gap: 8,
  },
  reportCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reportType: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.light.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "500",
  },
  reportDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  cameraStep: {
    flex: 1,
    padding: 20,
  },
  stepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  cameraPlaceholderText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
    marginTop: 16,
    textAlign: "center",
  },
  cameraActions: {
    gap: 8,
  },
  primaryButton: {
    backgroundColor: Colors.light.text,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.light.cardBackground,
  },
  secondaryButton: {
    backgroundColor: Colors.light.cardBackground,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.light.text,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  closeButton: {
    position: "absolute",
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraControls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.text,
  },
  previewImage: {
    width: "100%",
    height: 240,
    marginBottom: 24,
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.text,
    marginBottom: 8,
  },
  readOnlyField: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  readOnlyText: {
    fontSize: 15,
    color: Colors.light.text,
  },
  textArea: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: Colors.light.text,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.light.cardBackground,
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.cardBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  successSubtitle: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  doneButton: {
    backgroundColor: Colors.light.text,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  doneButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.light.cardBackground,
  },
});
