export type CitizenIssueType = 'missed_collection' | 'illegal_dumping';
export type DriverIssueType = 'mechanical_failure' | 'road_blocked' | 'truck_full' | 'other';
export type IssueStatus = 'open' | 'in_progress' | 'resolved';

export interface CitizenIssueReport {
  id: string;
  user_id: string;
  type: CitizenIssueType;
  status: IssueStatus;
  description?: string;
  photo_url?: string;
  lat: number;
  lng: number;
  created_at: Date;
}

export interface DriverIssueReport {
  id: string;
  driver_id: string;
  route_assignment_id: string;
  type: DriverIssueType;
  status: IssueStatus;
  notes?: string;
  lat: number;
  lng: number;
  created_at: Date;
}

export interface CreateCitizenIssueRequest {
  type: CitizenIssueType;
  description?: string;
  photo_url?: string;
  lat: number;
  lng: number;
}

export interface CreateDriverIssueRequest {
  type: DriverIssueType;
  notes?: string;
  lat: number;
  lng: number;
}

export interface IssueReportSummary {
  source: 'driver' | 'citizen';
  id: string;
  type: CitizenIssueType | DriverIssueType;
  status: IssueStatus;
  created_at: Date;
  description?: string;
  lat: number;
  lng: number;
}
