import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reportService } from "../services/report-service";

interface UseSubmitReportOptions {
  onSuccess?: () => void;
}

export const useSubmitReport = (options?: UseSubmitReportOptions) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reportService.submitReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      options?.onSuccess?.();
    },
  });
};
