import type { AssignmentStatus } from '../assignments/models';

export interface Truck {
  id: string;
  name: string;
  license_plate: string;
  is_active: boolean;
  created_at: Date;
}

export interface TruckWithDetails extends Truck {
  lat?: number;
  lng?: number;
  location_updated_at?: Date;
  driver_name?: string;
  assignment_status?: AssignmentStatus;
}

export interface CreateTruckRequest {
  name: string;
  license_plate: string;
}
