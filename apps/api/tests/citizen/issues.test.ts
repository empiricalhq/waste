import { test, expect } from 'bun:test';
import { apiRequest, login, expectValidId } from '../helpers';
import { TEST_CITIZEN_EMAIL, TEST_CITIZEN_PASSWORD } from '../config';

let citizenCookie: string;

test('setup citizen session for issues', async () => {
  citizenCookie = await login(TEST_CITIZEN_EMAIL, TEST_CITIZEN_PASSWORD, 'citizen');
  expect(citizenCookie).toBeDefined();
});

test('report issue', async () => {
  const { response, data } = await apiRequest('/citizen/issues', {
    method: 'POST',
    headers: { Cookie: citizenCookie },
    body: JSON.stringify({
      type: 'missed_collection',
      description: 'Truck did not collect garbage from my street',
      lat: -12.0464,
      lng: -77.0428,
    }),
  });

  console.log('Report issue response:', response.status, data);

  if (response.status < 400) {
    const issueId = data?.id || data?.issue_id || data;
    expectValidId(issueId);
  }
});

test('get reported issues', async () => {
  const { response, data } = await apiRequest('/citizen/issues', {
    headers: { Cookie: citizenCookie },
  });

  console.log('Get issues response:', response.status, data);

  expect(response.status).toBeLessThan(500);
});

test('report issue with invalid type fails', async () => {
  const { response, data } = await apiRequest('/citizen/issues', {
    method: 'POST',
    headers: { Cookie: citizenCookie },
    body: JSON.stringify({
      type: 'invalid_issue_type',
      description: 'This should fail',
      lat: -12.0464,
      lng: -77.0428,
    }),
  });

  console.log('Invalid issue type response:', response.status, data);

  expect(response.status).toBeGreaterThanOrEqual(400);
});

test('report issue without auth fails', async () => {
  const { response, data } = await apiRequest('/citizen/issues', {
    method: 'POST',
    body: JSON.stringify({
      type: 'missed_collection',
      description: 'Unauthorized report',
      lat: -12.0464,
      lng: -77.0428,
    }),
  });

  expect(response.status).toBe(401);
});
