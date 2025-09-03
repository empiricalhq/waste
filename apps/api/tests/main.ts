import { BASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, CITIZEN_EMAIL, CITIZEN_PASSWORD } from './config';

async function request(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = response.status === 204 ? null : await response.json().catch(() => null);

  console.log(`${options.method || 'GET'} ${endpoint} -> ${response.status}`);

  if (data) console.log(data);
  return { response, data };
}

async function login(email: string, password: string) {
  const { response } = await request('/auth/sign-in/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  return response.headers.get('set-cookie');
}

async function register(email: string, password: string) {
  const { response } = await request('/auth/sign-up/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name: email.split('@')[0] }),
  });

  return response.headers.get('set-cookie');
}

async function main() {
  console.log('Starting tests for @lima-garbage/api\n');

  console.log('test: admin login');
  const adminCookie = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
  if (adminCookie) {
    await request('/admin/trucks', { headers: { Cookie: adminCookie } });
    await request('/admin/routes', { headers: { Cookie: adminCookie } });
  }

  console.log('test: citizen registration');
  const citizenCookie = await register(CITIZEN_EMAIL, CITIZEN_PASSWORD);
  if (citizenCookie) {
    await request('/trucks/status', { headers: { Cookie: citizenCookie } });
  }

  console.log('test: security');
  await request('/admin/trucks'); // Should fail
  await request('/trucks/status'); // Should fail
  if (citizenCookie) {
    await request('/admin/trucks', { headers: { Cookie: citizenCookie } }); // Should fail
  }

  console.log('\nTests completed');
}

main().catch(console.error);
