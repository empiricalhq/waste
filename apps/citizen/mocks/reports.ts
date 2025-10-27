export type ReportStatus = "pending" | "in-progress" | "resolved";

export type Report = {
  id: string;
  type: string;
  description: string;
  location: string;
  imageUri?: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
};

export const REPORT_TYPES = [
  { id: "missed", label: "Missed Collection", icon: "calendar-x" },
  { id: "overflow", label: "Overflowing Bin", icon: "trash" },
  { id: "damage", label: "Damaged Bin", icon: "alert-circle" },
  { id: "illegal", label: "Illegal Dumping", icon: "alert-triangle" },
  { id: "other", label: "Other Issue", icon: "help-circle" },
];

export const MOCK_REPORTS: Report[] = [
  {
    id: "rep-1",
    type: "Missed Collection",
    description: "Recycling bin was not collected this morning",
    location: "123 Main St",
    status: "in-progress",
    createdAt: "2025-10-13T08:30:00Z",
    updatedAt: "2025-10-13T10:00:00Z",
  },
  {
    id: "rep-2",
    type: "Overflowing Bin",
    description: "General waste bin is overflowing",
    location: "456 Oak Ave",
    status: "resolved",
    createdAt: "2025-10-10T14:20:00Z",
    updatedAt: "2025-10-11T09:00:00Z",
  },
];
