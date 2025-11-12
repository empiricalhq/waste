export interface Location {
  lat: number;
  lng: number;
}

export interface LocationUpdate extends Location {
  speed?: number;
  heading?: number;
}

export interface TruckStatusResponse {
  status: 'LOCATION_NOT_SET' | 'NEARBY' | 'ON_THE_WAY' | 'NOT_SCHEDULED';
  message?: string;
  etaMinutes?: number;
  truck?: string;
}

export interface TruckWithLocation {
  id: string;
  name: string;
  license_plate: string;
  lat: number;
  lng: number;
  location_updated_at: Date;
  assignment_status?: string;
}
