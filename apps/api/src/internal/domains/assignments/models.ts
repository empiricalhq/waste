import type { RouteWaypoint } from '../routes/models';

export type AssignmentStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

export interface RouteAssignment {
  id: string;
  route_id: string;
  truck_id: string;
  driver_id: string;
  assigned_date: Date;
  scheduled_start_time: Date;
  scheduled_end_time: Date;
  status: AssignmentStatus;
  actual_start_time?: Date;
  actual_end_time?: Date;
  notes?: string;
  assigned_by: string;
}

export interface AssignmentWithDetails extends RouteAssignment {
  route_name: string;
  route_description?: string;
  start_lat: number;
  start_lng: number;
  truck_name: string;
  license_plate: string;
  waypoints: RouteWaypoint[];
}

export interface CreateAssignmentRequest {
  route_id: string;
  truck_id: string;
  driver_id: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  notes?: string;
}
