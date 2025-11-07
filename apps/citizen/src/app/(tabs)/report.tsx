import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ReportCameraStep } from '@/components/report/report-camera-step';
import { ReportDetailsStep } from '@/components/report/report-details-step';
import { ReportSuccessStep } from '@/components/report/report-success-step';
import { ReportTypeStep } from '@/components/report/report-type-step';
import { AuthPrompt } from '@/components/shared/auth-prompt';
import { Header } from '@/components/shared/header';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useReportTypes } from '@/features/reports/hooks/use-reports';
import { useSubmitReport } from '@/features/reports/hooks/use-submit-report';

type ReportStep = 'type' | 'camera' | 'details' | 'success';

export default function ReportScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState<ReportStep>('type');
  const [reportData, setReportData] = useState({ type: '', imageUri: '' });

  const { data: reportTypes, isLoading } = useReportTypes();
  const { mutate: submitReport, isPending } = useSubmitReport({
    onSuccess: () => setStep('success'),
  });

  const handleSelectType = (type: string) => {
    setReportData({ ...reportData, type });
    setStep('camera');
  };

  const handlePhotoTaken = (uri: string) => {
    setReportData({ ...reportData, imageUri: uri });
    setStep('details');
  };

  const handleSkipPhoto = () => {
    setStep('details');
  };

  const handleSubmit = (details: { description: string; location: string }) => {
    submitReport({ ...reportData, ...details });
  };

  const resetFlow = () => {
    setReportData({ type: '', imageUri: '' });
    setStep('type');
  };

  const renderContent = () => {
    if (!user) {
      return (
        <AuthPrompt
          title="Función para miembros"
          message="Para enviar un reporte y ayudarnos a dar seguimiento, por favor inicia sesión o crea una cuenta."
        />
      );
    }

    switch (step) {
      case 'type':
        return isLoading ? (
          <LoadingSpinner fullScreen={true} />
        ) : (
          <ReportTypeStep reportTypes={reportTypes || []} onSelectType={handleSelectType} />
        );
      case 'camera':
        return <ReportCameraStep onPhotoTaken={handlePhotoTaken} onSkip={handleSkipPhoto} />;
      case 'details':
        return (
          <ReportDetailsStep
            reportType={reportData.type}
            imageUri={reportData.imageUri}
            isSubmitting={isPending}
            onSubmit={handleSubmit}
          />
        );
      case 'success':
        return <ReportSuccessStep onDone={resetFlow} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Reportar un problema" />
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
