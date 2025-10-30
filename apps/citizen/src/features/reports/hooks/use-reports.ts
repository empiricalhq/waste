import { useQuery } from "@tanstack/react-query";
import { reportService } from "../services/report-service";

export const useReports = () => {
  return useQuery({
    queryKey: ["reports"],
    queryFn: reportService.getReports,
  });
};

export const useReportTypes = () => {
  return useQuery({
    queryKey: ["reportTypes"],
    queryFn: reportService.getReportTypes,
  });
};
