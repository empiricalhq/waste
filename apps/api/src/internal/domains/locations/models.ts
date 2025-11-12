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
