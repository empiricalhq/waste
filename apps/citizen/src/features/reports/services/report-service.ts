import { apiClient } from "@/lib/api/api-client";
import { Report, ReportType } from "@/types";

interface CreateReportPayload {
  type: string;
  description: string;
  location: string;
  imageUri?: string;
}

export const reportService = {
  getReports: async (): Promise<Report[]> => {
    return apiClient.get<Report[]>("/reports");
  },
  getReportTypes: async (): Promise<ReportType[]> => {
    return apiClient.get<ReportType[]>("/report-types");
  },
  submitReport: async (payload: CreateReportPayload): Promise<Report> => {
    return apiClient.post<Report>("/reports", payload);
  },
};
