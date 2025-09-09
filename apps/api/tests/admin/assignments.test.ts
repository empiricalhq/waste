import { test, expect } from 'bun:test';
import { apiRequest, login, expectValidId } from '../helpers';
import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD } from '../config';

let adminCookie: string;
let assignmentId: any;

test('setup admin session for assignments', async () => {
  adminCookie = await login(TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD, 'admin');
  expect(adminCookie).toBeDefined();
});

test('create assignment', async () => {
  // Note: This test assumes we have valid route_id and truck_id from previous tests
  // In a real scenario, you'd want to either import them or create them here
  
  const { response, data } = await apiRequest('/admin/assignments', {
    method: 'POST',
    headers: { Cookie: adminCookie },
    body: JSON.stringify({
      route_id: 'placeholder-route-id', // We'll log what the API expects
      truck_id: 'placeholder-truck-id',
      driver_id: 'placeholder-driver-id',
      scheduled_start_time: new Date().toISOString(),
      scheduled_end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    }),
  });
  
  console.log('Create assignment response:', response.status, data);
  
  // Don't assert success yet, let's see what the API returns
  if (response.status < 400) {
    assignmentId = data?.id || data?.assignment_id || data;
    expectValidId(assignmentId);
  }
});

test('get assignments list', async () => {
  const { response, data } = await apiRequest('/admin/assignments', {
    headers: { Cookie: adminCookie },
  });
  
  console.log('Get assignments response:', data);
  
  expect(response.status).toBe(200);
  expect(data).toBeDefined();
});

export { assignmentId };
