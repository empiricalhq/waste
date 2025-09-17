export interface Location {
  lat: number;
  lng: number;
}

export interface Waypoint extends Location {
  sequence_order: number;
}
