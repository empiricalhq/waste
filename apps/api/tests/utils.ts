const LICENSE_PLATE_SUFFIX_LENGTH = 6;

export function generateLicensePlate(prefix = 'T'): string {
  return `${prefix}${Date.now().toString().slice(-LICENSE_PLATE_SUFFIX_LENGTH)}`;
}

export function createTestTruck(name = 'Test Truck') {
  return {
    name,
    license_plate: generateLicensePlate('T'),
  };
}

export function createTestRoute(name = 'Test Route') {
  return {
    name,
    description: 'Test route description',
    start_lat: -12.04,
    start_lng: -77.04,
    estimated_duration_minutes: 90,
    waypoints: [
      { lat: -12.04, lng: -77.04, sequence_order: 1 },
      { lat: -12.05, lng: -77.03, sequence_order: 2 },
    ],
  };
}

export function createTestIssue(type = 'missed_collection') {
  return {
    type,
    description: 'Test issue description',
    lat: -12.1,
    lng: -77.1,
  };
}
