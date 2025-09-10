import {
  BASE_URL,
  TEST_ADMIN_EMAIL,
  TEST_ADMIN_PASSWORD,
  TEST_DRIVER_EMAIL,
  TEST_DRIVER_PASSWORD,
  TEST_CITIZEN_EMAIL,
  TEST_CITIZEN_PASSWORD,
} from './config.ts';
import { apiRequest, login } from './helpers.ts';

async function main() {
  console.log('🧪 Starting Lima Verde API Tests\n');

  try {
    // 1. Test health endpoint
    console.log('--- Health Check ---');
    const { data: health } = await apiRequest('/health');
    console.log('Health:', health);

    // 2. Admin login
    console.log('\n--- Admin Setup ---');
    const adminCookie = await login(TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD, 'admin');
    console.log('Admin logged in successfully');

    // 3. Create truck
    console.log('\n--- Create Truck ---');
    const { data: truck } = await apiRequest('/admin/trucks', {
      method: 'POST',
      headers: { Cookie: adminCookie },
      body: JSON.stringify({
        name: 'Test Truck 1',
        license_plate: 'ABC-123',
      }),
    });
    console.log('Created truck:', truck);

    // 4. Create route
    console.log('\n--- Create Route ---');
    const { data: route } = await apiRequest('/admin/routes', {
      method: 'POST',
      headers: { Cookie: adminCookie },
      body: JSON.stringify({
        name: 'Downtown Route',
        description: 'Main downtown collection route',
        start_lat: -12.0464,
        start_lng: -77.0428,
        estimated_duration_minutes: 120,
        waypoints: [
          { lat: -12.0464, lng: -77.0428, sequence_order: 1 },
          { lat: -12.05, lng: -77.04, sequence_order: 2 },
        ],
      }),
    });
    console.log('Created route:', route);

    // 5. Driver workflow
    console.log('\n--- Driver Workflow ---');
    const driverCookie = await login(TEST_DRIVER_EMAIL, TEST_DRIVER_PASSWORD, 'driver');

    // Create assignment first (would normally be done by admin)
    const { data: assignment } = await apiRequest('/admin/assignments', {
      method: 'POST',
      headers: { Cookie: adminCookie },
      body: JSON.stringify({
        route_id: route.id,
        truck_id: truck.id,
        driver_id: 'driver-user-id', // Would need actual driver ID
        scheduled_start_time: new Date().toISOString(),
        scheduled_end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      }),
    });

    // Driver gets current route
    const { data: currentRoute } = await apiRequest('/driver/route/current', {
      headers: { Cookie: driverCookie },
    });
    console.log('Driver current route:', currentRoute);

    // 6. Citizen workflow
    console.log('\n--- Citizen Workflow ---');
    const citizenCookie = await login(TEST_CITIZEN_EMAIL, TEST_CITIZEN_PASSWORD, 'citizen');

    // Set location
    await apiRequest('/citizen/profile/location', {
      method: 'PUT',
      headers: { Cookie: citizenCookie },
      body: JSON.stringify({
        lat: -12.0464,
        lng: -77.0428,
      }),
    });
    console.log('Citizen location updated');

    // Check truck status
    const { data: truckStatus } = await apiRequest('/citizen/truck/status', {
      headers: { Cookie: citizenCookie },
    });
    console.log('Truck status:', truckStatus);

    // Report issue
    const { data: issue } = await apiRequest('/citizen/issues', {
      method: 'POST',
      headers: { Cookie: citizenCookie },
      body: JSON.stringify({
        type: 'missed_collection',
        description: 'Truck did not collect garbage from my street',
        lat: -12.0464,
        lng: -77.0428,
      }),
    });
    console.log('Issue reported:', issue);

    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
main().catch(console.error);
