import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ReportCameraStep } from '@/components/report/report-camera-step';
import { ReportDetailsStep } from '@/components/report/report-details-step';
import { ReportSuccessStep } from '@/components/report/report-success-step';
import { ReportTypeStep } from '@/components/report/report-type-step';
import { AuthPrompt } from '@/components/shared/auth-prompt';
import { ErrorState } from '@/components/shared/error-state';
import { Header } from '@/components/shared/header';
import { ListSkeleton } from '@/components/shared/loading-skeleton';
import { Colors, Spacing, Typography } from '@/constants/design-tokens';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { ReportFeatureWrapper } from '@/features/reports/components/report-feature-wrapper';
import { useReportTypes } from '@/features/reports/hooks/use-reports';
import { useSubmitReport } from '@/features/reports/hooks/use-submit-report';
import { useNetworkStatus } from '@/lib/hooks/use-network-status';

type ReportStep = 'type' | 'camera' | 'details' | 'success';

function ReportScreenContent() {
  const { user } = useAuth();
  const { isOffline } = useNetworkStatus();
  const [step, setStep] = useState<ReportStep>('type');
  const [reportData, setReportData] = useState({ type: '', imageUri: '', description: '', location: '' });
  const [submitError, setSubmitError] = useState<Error | null>(null);

  const { data: reportTypes, isLoading, error, refetch } = useReportTypes();
  const { mutate: submitReport, isPending } = useSubmitReport({
    onSuccess: () => {
      setSubmitError(null);
      setStep('success');
    },
    onError: (error) => {
      setSubmitError(error);
    },
  });

  const handleRetrySubmit = () => {
    if (reportData.type && reportData.description && reportData.location) {
      setSubmitError(null);
      // Re-submit with current data
      submitReport({
        type: reportData.type,
        description: reportData.description,
        location: reportData.location,
        imageUri: reportData.imageUri,
      });
    }
  };

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
    const fullReportData = { ...reportData, ...details };
    setReportData(fullReportData);
    submitReport({
      type: fullReportData.type,
      description: fullReportData.description,
      location: fullReportData.location,
      imageUri: fullReportData.imageUri,
    });
  };

  const resetFlow = () => {
    setReportData({ type: '', imageUri: '', description: '', location: '' });
    setSubmitError(null);
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
        if (isLoading) {
          return (
            <View style={styles.content}>
              <ListSkeleton count={3} />
            </View>
          );
        }
        if (error) {
          return <ErrorState error={error} onRetry={refetch} isOffline={isOffline} />;
        }
        return <ReportTypeStep reportTypes={reportTypes || []} onSelectType={handleSelectType} />;
      case 'camera':
        return <ReportCameraStep onPhotoTaken={handlePhotoTaken} onSkip={handleSkipPhoto} />;
      case 'details':
        if (submitError) {
          return (
            <ErrorState
              error={submitError}
              onRetry={handleRetrySubmit}
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
                  📱 Sin conexión - Tu reporte se enviará cuando vuelvas a estar en línea
                </Text>
              </View>
            )}
            <ReportDetailsStep
              reportType={reportData.type}
              imageUri={reportData.imageUri}
              isSubmitting={isPending}
              onSubmit={handleSubmit}
            />
          </>
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

export default function ReportScreen() {
  return (
    <ReportFeatureWrapper>
      <ReportScreenContent />
    </ReportFeatureWrapper>
  );
}

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
    borderRadius: 8,
  },
  offlineText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },

});
