import { ENDPOINTS } from './config';
import { login, register, fetchAndPrint } from './utils';

export async function testAdminFlow(adminEmail: string, adminPassword: string): Promise<string | null> {
  console.log('\n=== testing: admin flow (web) ===');
  const adminCookie = await login(adminEmail, adminPassword);

  if (adminCookie) {
    console.log('Admin logged in successfully. Fetching admin endpoints...');
    await fetchAndPrint(ENDPOINTS.ADMIN_TRUCKS, adminCookie);
    await fetchAndPrint(ENDPOINTS.ADMIN_ROUTES, adminCookie);
  } else {
    console.log('Could not log in as admin. Skipping admin tests.');
    console.log(
      "Tip: Try registering the admin user first using the seed.ts file in the packages/database directory. If that doesn't work, check credentials.",
    );
  }

  return adminCookie;
}

export async function testCitizenFlow(citizenEmail: string, citizenPassword: string): Promise<string | null> {
  console.log('\n=== testing: citizen app ===');
  const citizenCookie = await register(citizenEmail, citizenPassword);

  if (citizenCookie) {
    console.log('Citizen registered successfully. Fetching citizen endpoints...');
    await fetchAndPrint(ENDPOINTS.TRUCK_STATUS, citizenCookie);
  } else {
    console.log('Could not register citizen. Skipping citizen tests.');
  }

  return citizenCookie;
}

export async function testSecurityScenarios(adminCookie: string | null, citizenCookie: string | null): Promise<void> {
  console.log('\n=== testing: security scenarios ===');

  // a user with the citizen role trying to access an admin route
  // (we should return 403 Forbidden)
  if (citizenCookie) {
    console.log('Testing citizen accessing admin route...');
    await fetchAndPrint(ENDPOINTS.ADMIN_TRUCKS, citizenCookie);
  }

  // an unauthenticated user trying to access protected routes
  // (we should return 401 Unauthorized)
  console.log('Testing unauthenticated access to admin route...');
  await fetchAndPrint(ENDPOINTS.ADMIN_TRUCKS, null);

  console.log('Testing unauthenticated access to citizen route...');
  await fetchAndPrint(ENDPOINTS.TRUCK_STATUS, null);
}
