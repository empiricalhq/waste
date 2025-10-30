import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reportService } from "../services/report-service";

export const useSubmitReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reportService.submitReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};
