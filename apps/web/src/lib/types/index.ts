// user and authentication
export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  gender: 'male' | 'female';
  appRole: 'admin' | 'supervisor' | 'driver';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthSession {
  user: User;
  session: Session;
}

// vehicle/truck types
export interface Vehicle {
  id: string;
  license_plate: string;
  model?: string;
  year?: number;
  capacity?: number;
  lat: number | null;
  lng: number | null;
  status: 'active' | 'inactive' | 'maintenance';
  assignedDriverId?: string;
  assignedDriver?: User;
  createdAt: string;
  updatedAt: string;
}

// backward compatibility
export type Truck = Vehicle;

// route types
export interface RouteWaypoint {
  id: string;
  routeId: string;
  lat: number;
  lng: number;
  order: number;
  address?: string;
  estimatedTime?: string;
  completed: boolean;
  createdAt: string;
}

export interface Route {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'completed';
  assignedVehicleId?: string;
  assignedVehicle?: Vehicle;
  assignedDriverId?: string;
  assignedDriver?: User;
  waypoints: RouteWaypoint[];
  estimatedDuration?: number; // in minutes
  actualDuration?: number; // in minutes
  startTime?: string;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
}

// issue types
export interface Issue {
  id: string;
  title: string;
  description?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'vehicle' | 'route' | 'driver' | 'equipment' | 'other';
  reportedById: string;
  reportedBy: User;
  assignedToId?: string;
  assignedTo?: User;
  vehicleId?: string;
  vehicle?: Vehicle;
  routeId?: string;
  route?: Route;
  lat?: number;
  lng?: number;
  reportedAt: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// alert types
export interface Alert {
  id: string;
  message: string;
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'system' | 'vehicle' | 'route' | 'driver' | 'maintenance';
  isRead: boolean;
  userId?: string; // If targeted to specific user
  vehicleId?: string;
  vehicle?: Vehicle;
  routeId?: string;
  route?: Route;
  issueId?: string;
  issue?: Issue;
  timestamp: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// dashboard Types
export interface DashboardStats {
  totalVehicles: number;
  activeVehicles: number;
  totalRoutes: number;
  activeRoutes: number;
  totalDrivers: number;
  activeDrivers: number;
  openIssues: number;
  criticalAlerts: number;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// form Types (for validation)
export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  gender: 'male' | 'female';
  role: 'admin' | 'supervisor' | 'driver';
}

export interface VehicleFormData {
  license_plate: string;
  model?: string;
  year?: number;
  capacity?: number;
  assignedDriverId?: string;
}

export interface RouteFormData {
  name: string;
  description?: string;
  assignedVehicleId?: string;
  assignedDriverId?: string;
  waypoints: Array<{
    lat: number;
    lng: number;
    address?: string;
    order: number;
  }>;
}

export interface IssueFormData {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'vehicle' | 'route' | 'driver' | 'equipment' | 'other';
  assignedToId?: string;
  vehicleId?: string;
  routeId?: string;
  lat?: number;
  lng?: number;
}

// utility Types
export type AppRole = User['appRole'];
export type VehicleStatus = Vehicle['status'];
export type RouteStatus = Route['status'];
export type IssueStatus = Issue['status'];
export type IssuePriority = Issue['priority'];
export type AlertSeverity = Alert['severity'];

// type guards
export const isAdmin = (user: User): boolean => user.appRole === 'admin';
export const isSupervisor = (user: User): boolean => user.appRole === 'supervisor';
export const isDriver = (user: User): boolean => user.appRole === 'driver';
export const isAuthorized = (user: User): boolean => isAdmin(user) || isSupervisor(user);
