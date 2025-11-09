import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mutationQueue } from '@/lib/offline/mutation-queue';
import { AppError } from '@/lib/utils/error-handler';
import type { Report } from '@/types';
import { reportService } from '../services/report-service';

interface UseSubmitReportOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface CreateReportPayload {
  type: string;
  description: string;
  location: string;
  imageUri?: string;
}

export const useSubmitReport = (options?: UseSubmitReportOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reportService.submitReport,

    // Before mutation - add optimistic update
    onMutate: async (newReport: CreateReportPayload) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['reports'] });

      // Snapshot previous value for rollback
      const previousReports = queryClient.getQueryData<Report[]>(['reports']);

      // Create optimistic report
      const optimisticReport: Report = {
        id: `temp-${Date.now()}`,
        type: newReport.type,
        description: newReport.description,
        status: 'pending',
      };

      // Optimistically update the cache
      queryClient.setQueryData<Report[]>(['reports'], (old = []) => [optimisticReport, ...old]);

      // Return context for rollback
      return { previousReports, optimisticReport };
    },

    // On error - rollback optimistic update
    onError: (error, variables, context) => {
      // Rollback to previous state
      if (context?.previousReports) {
        queryClient.setQueryData(['reports'], context.previousReports);
      }

      // Queue mutation for retry if it's a network error
      if (error instanceof AppError && error.code === 'NETWORK_ERROR') {
        mutationQueue.add({
          mutationKey: ['submitReport'],
          variables,
          maxRetries: 3,
        });
      }

      // Call custom error handler
      options?.onError?.(error as Error);
    },

    // On success - replace optimistic update with real data
    onSuccess: (data, _variables, context) => {
      // Replace optimistic report with real data
      queryClient.setQueryData<Report[]>(['reports'], (old = []) =>
        old.map((report) => (report.id === context?.optimisticReport.id ? data : report)),
      );

      // Call custom success handler
      options?.onSuccess?.();
    },

    // Always refetch to ensure consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};
