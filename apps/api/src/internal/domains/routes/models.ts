export type RouteStatus = 'active' | 'inactive' | 'draft';

export interface Route {
  id: string;
  name: string;
  description?: string;
  start_lat: number;
  start_lng: number;
  estimated_duration_minutes: number;
  status: RouteStatus;
  created_by: string;
}

export interface RouteWaypoint {
  id: string;
  route_id: string;
  sequence_order: number;
  lat: number;
  lng: number;
}

export interface RouteWithDetails extends Route {
  created_by_name?: string;
  waypoint_count: number;
}

export interface Waypoint {
  lat: number;
  lng: number;
  sequence_order: number;
}

export interface CreateRouteRequest {
  name: string;
  description?: string;
  start_lat: number;
  start_lng: number;
  estimated_duration_minutes: number;
  waypoints: Waypoint[];
}
