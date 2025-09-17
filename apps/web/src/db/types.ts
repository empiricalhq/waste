// Enums
export type AppRole = 'admin' | 'supervisor' | 'driver' | 'citizen';
export type Gender = 'male' | 'female';
export type AlertStatus = 'unread' | 'read' | 'archived';
export type AlertType = 'route_deviation' | 'prolonged_stop' | 'late_start';
export type AssignmentStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';
export type IssueStatus = 'open' | 'in_progress' | 'resolved';
export type RouteStatus = 'active' | 'inactive' | 'draft';

// Tables
export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  appRole: AppRole;
  isActive: boolean;
  createdAt: string; // ISO Date String
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string; // ISO Date String
}

export interface Truck {
  id: string;
  name: string;
  license_plate: string;
  is_active: boolean;
  created_at: string;
  lat?: number | null;
  lng?: number | null;
  location_updated_at?: string | null;
  driver_name?: string | null;
  assignment_status?: string | null;
}

export interface Route {
  id: string;
  name: string;
  description?: string;
  status: RouteStatus;
  created_by_name?: string;
  waypoint_count?: number;
}

export interface SystemAlert {
  id: string;
  message: string;
  type: AlertType;
  status: AlertStatus;
  createdAt: string; // ISO Date String
}

export interface Issue {
  source: 'driver' | 'citizen';
  id: string;
  type: string;
  status: string;
  created_at: string;
  description: string | null;
  lat: number;
  lng: number;
}
