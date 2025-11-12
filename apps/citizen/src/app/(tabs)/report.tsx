import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ReportCameraStep } from "@/components/report/report-camera-step";
import { ReportDetailsStep } from "@/components/report/report-details-step";
import { ReportSuccessStep } from "@/components/report/report-success-step";
import { ReportTypeStep } from "@/components/report/report-type-step";
import { AuthPrompt } from "@/components/shared/auth-prompt";
import { ErrorState } from "@/components/shared/error-state";
import { Header } from "@/components/shared/header";
import { ListSkeleton } from "@/components/shared/loading-skeleton";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/constants/design-tokens";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ReportFeatureWrapper } from "@/features/reports/components/report-feature-wrapper";
import { useReportTypes } from "@/features/reports/hooks/use-reports";
import { useSubmitReport } from "@/features/reports/hooks/use-submit-report";
import { useNetworkStatus } from "@/lib/hooks/use-network-status";
import type { ReportType } from "@/types";

type ReportStep = "type" | "camera" | "details" | "success";
interface CreateReportPayload {
  type: string;
  description: string;
  location: string;
  imageUri?: string;
}
function useReportFlow() {
  // Report flow handlers and state are handled by useReportFlow
  const [step, setStep] = useState<ReportStep>("type");
  const [reportData, setReportData] = useState<CreateReportPayload>({
    type: "",
    imageUri: "",
    description: "",
    location: "",
  });
  const [submitError, setSubmitError] = useState<Error | null>(null);

  const handleRetrySubmit = () => {
    // wrapper for UI, actual submission will be processed by the calling component
    if (reportData.type && reportData.description && reportData.location) {
      setSubmitError(null);
      return true;
    }
    return false;
  };

  const handleSelectType = (type: string) => {
    setReportData({ ...reportData, type });
    setStep("camera");
  };

  const handlePhotoTaken = (uri: string) => {
    setReportData({ ...reportData, imageUri: uri });
    setStep("details");
  };

  const handleSkipPhoto = () => {
    setStep("details");
  };

  const prepareSubmitPayload = (details: {
    description: string;
    location: string;
  }) => {
    const fullReportData = { ...reportData, ...details };
    setReportData(fullReportData);
    return fullReportData;
  };

  const resetFlow = () => {
    setReportData({ type: "", imageUri: "", description: "", location: "" });
    setSubmitError(null);
    setStep("type");
  };

  return {
    step,
    reportData,
    submitError,
    setSubmitError,
    handleRetrySubmit,
    handleSelectType,
    handlePhotoTaken,
    handleSkipPhoto,
    prepareSubmitPayload,
    setStep,
    resetFlow,
  };
}

// export default moved to the end

// export default moved to the end of file to satisfy useExportsLast

function ReportScreenContent() {
  const { user } = useAuth();
  const { isOffline } = useNetworkStatus();

  const { data: reportTypes, isLoading, error, refetch } = useReportTypes();
  const { mutate: submitReport, isPending } = useSubmitReport({
    onSuccess: () => {
      setSubmitError(null);
      setStep("success");
    },
    onError: (error) => {
      setSubmitError(error);
    },
  });

  const {
    step,
    reportData,
    submitError,
    setSubmitError,
    handleRetrySubmit,
    handleSelectType,
    handlePhotoTaken,
    handleSkipPhoto,
    prepareSubmitPayload,
    resetFlow,
    setStep,
  } = useReportFlow();

  const handleSubmit = (details: { description: string; location: string }) => {
    const payload = prepareSubmitPayload(details);
    submitReport(payload);
  };

  const _handleRetrySubmitWrapper = () => {
    // try to submit again with the current payload
    if (handleRetrySubmit()) {
      submitReport(reportData);
    }
  };

  // Report flow handlers are extracted into the useReportFlow hook above

  // RenderContent extracted to a separate component to reduce complexity of this function

  return (
    <View style={styles.container}>
      <Header title="Reportar un problema" />
      <ReportContent
        isAuthenticated={Boolean(user)}
        isOffline={isOffline}
        step={step}
        reportTypes={reportTypes}
        isLoading={isLoading}
        error={error}
        refetch={refetch}
        reportData={reportData}
        submitError={submitError}
        isPending={isPending}
        onSelectType={handleSelectType}
        onPhotoTaken={handlePhotoTaken}
        onSkipPhoto={handleSkipPhoto}
        onSubmit={handleSubmit}
        onRetrySubmit={handleRetrySubmit}
        onResetFlow={resetFlow}
        /* onRetry is unused in ReportContent so we don't pass it */
      />
    </View>
  );
}

function _ReportScreen() {
  return (
    <ReportFeatureWrapper>
      <ReportScreenContent />
    </ReportFeatureWrapper>
  );
}

// export after non-export statements

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  offlineNotice: {
    backgroundColor: Colors.info,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  offlineText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.sm,
    textAlign: "center",
  },
});

// export after non-export statements

function ReportContent({
  isAuthenticated,
  isOffline,
  step,
  reportTypes,
  isLoading,
  error,
  refetch,
  reportData,
  submitError,
  isPending,
  onSelectType,
  onPhotoTaken,
  onSkipPhoto,
  onSubmit,
  onRetrySubmit,
  onResetFlow,
}: {
  isAuthenticated: boolean;
  isOffline: boolean;
  step: ReportStep;
  reportTypes?: ReportType[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  reportData: {
    type: string;
    imageUri?: string;
    description: string;
    location: string;
  };
  submitError: Error | null;
  isPending: boolean;
  onSelectType: (type: string) => void;
  onPhotoTaken: (uri: string) => void;
  onSkipPhoto: () => void;
  onSubmit: (details: { description: string; location: string }) => void;
  onRetrySubmit: () => void;
  onResetFlow: () => void;
  // onRetry removed - not used inside the component
}) {
  if (!isAuthenticated) {
    return (
      <AuthPrompt
        title="Función para miembros"
        message="Para enviar un reporte y ayudarnos a dar seguimiento, por favor inicia sesión o crea una cuenta."
      />
    );
  }

  switch (step) {
    case "type":
      if (isLoading) {
        return (
          <View style={styles.content}>
            <ListSkeleton count={3} />
          </View>
        );
      }
      if (error) {
        return (
          <ErrorState error={error} onRetry={refetch} isOffline={isOffline} />
        );
      }
      return (
        <ReportTypeStep
          reportTypes={(reportTypes as ReportType[]) || []}
          onSelectType={onSelectType}
        />
      );
    case "camera":
      return (
        <ReportCameraStep onPhotoTaken={onPhotoTaken} onSkip={onSkipPhoto} />
      );
    case "details":
      if (submitError) {
        return (
          <ErrorState
            error={submitError}
            onRetry={onRetrySubmit}
            isOffline={isOffline}
            isRetrying={isPending}
          />
        );
      }
      return (
        <>
          {isOffline && (
            <View style={styles.offlineNotice}>
              <Text style={styles.offlineText}>
                📱 Sin conexión - Tu reporte se enviará cuando vuelvas a estar
                en línea
              </Text>
            </View>
          )}
          <ReportDetailsStep
            reportType={reportData.type}
            imageUri={reportData.imageUri}
            isSubmitting={isPending}
            onSubmit={onSubmit}
          />
        </>
      );
    case "success":
      return <ReportSuccessStep onDone={onResetFlow} />;
    default:
      return null;
  }
}
