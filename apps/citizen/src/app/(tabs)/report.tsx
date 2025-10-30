import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Header } from "@/components/shared/header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useReportTypes } from "@/features/reports/hooks/use-reports";
import { useSubmitReport } from "@/features/reports/hooks/use-submit-report";
import { ReportTypeStep } from "@/components/report/report-type-step";
import { ReportCameraStep } from "@/components/report/report-camera-step";
import { ReportDetailsStep } from "@/components/report/report-details-step";
import { ReportSuccessStep } from "@/components/report/report-success-step";

type ReportStep = "type" | "camera" | "details" | "success";

export default function ReportScreen() {
  const [step, setStep] = useState<ReportStep>("type");
  const [reportData, setReportData] = useState({ type: "", imageUri: "" });

  const { data: reportTypes, isLoading } = useReportTypes();
  const { mutate: submitReport, isPending } = useSubmitReport({
    onSuccess: () => setStep("success"),
  });

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

  const handleSubmit = (details: { description: string; location: string }) => {
    submitReport({ ...reportData, ...details });
  };

  const resetFlow = () => {
    setReportData({ type: "", imageUri: "" });
    setStep("type");
  };

  const renderStep = () => {
    switch (step) {
      case "type":
        return isLoading ? (
          <LoadingSpinner fullScreen />
        ) : (
          <ReportTypeStep reportTypes={reportTypes || []} onSelectType={handleSelectType} />
        );
      case "camera":
        return <ReportCameraStep onPhotoTaken={handlePhotoTaken} onSkip={handleSkipPhoto} />;
      case "details":
        return (
          <ReportDetailsStep
            reportType={reportData.type}
            imageUri={reportData.imageUri}
            isSubmitting={isPending}
            onSubmit={handleSubmit}
          />
        );
      case "success":
        return <ReportSuccessStep onDone={resetFlow} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Reportar un Problema" />
      {renderStep()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
