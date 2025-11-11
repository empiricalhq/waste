import { apiClient } from "@/lib/api/api-client";
import type { Report, ReportType } from "@/types";

interface CreateReportPayload {
  type: string;
  description: string;
  location: string;
  imageUri?: string;
}

export const reportService = {
  /**
   * Fetches the user's past reports.
   * This is a protected endpoint.
   */
  getReports: async (): Promise<Report[]> => {
    return apiClient.get<Report[]>("/reports");
  },
  /**
   * Fetches the available types of reports.
   * This is a public endpoint accessible to guest users.
   */
  getReportTypes: async (): Promise<ReportType[]> => {
    return apiClient.get<ReportType[]>("/report-types");
  },
  /**
   * Submits a new report.
   * This is a protected endpoint.
   */
  submitReport: async (payload: CreateReportPayload): Promise<Report> => {
    return apiClient.post<Report, CreateReportPayload>("/reports", payload);
  },
};
