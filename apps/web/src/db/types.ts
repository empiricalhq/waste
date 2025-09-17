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
  licensePlate: string;
  isActive: boolean;
}

export interface TruckLocation {
  truckId: string;
  lat: number;
  lng: number;
}

export interface Route {
  id: string;
  name: string;
  description?: string;
  status: RouteStatus;
}

export interface SystemAlert {
  id: string;
  message: string;
  type: AlertType;
  status: AlertStatus;
  createdAt: string; // ISO Date String
}
