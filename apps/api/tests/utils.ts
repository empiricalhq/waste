import { BASE_URL, ENDPOINTS } from './config';

export function prettyPrint(label: string, data: any, status: number): void {
  const color = status >= 200 && status < 300 ? '\x1b[32m' : '\x1b[31m';
  const resetColor = '\x1b[0m';

  console.log(`\n--- ${label} (${color}${status}${resetColor}) ---`);
  try {
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.log('Could not stringify data:', data);
  }
  console.log('--- end ---\n');
}

// this function returns the session cookie string if successful.
export async function register(email: string, password: string): Promise<string | null> {
  console.log(`Attempting to register ${email}...`);
  try {
    const response = await fetch(`${BASE_URL}${ENDPOINTS.REGISTER}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name: email.split('@')[0] }),
    });

    const data = await response.json();
    prettyPrint(`REGISTER ${email}`, data, response.status);

    if (!response.ok) {
      console.error('Registration failed.');
      return null;
    }

    return response.headers.get('set-cookie');
  } catch (error) {
    console.error('Error during registration:', error);
    return null;
  }
}

// returns the session cookie string if successful.
export async function login(email: string, password: string): Promise<string | null> {
  console.log(`Attempting to log in as ${email}...`);
  try {
    const response = await fetch(`${BASE_URL}${ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    prettyPrint(`LOGIN ${email}`, data, response.status);

    if (!response.ok) {
      console.error('Login failed.');
      return null;
    }

    const cookie = response.headers.get('set-cookie');
    if (!cookie) {
      console.error('Login successful, but no cookie was returned.');
      return null;
    }
    return cookie;
  } catch (error) {
    console.error('Error during login:', error);
    return null;
  }
}

export async function fetchAndPrint(endpoint: string, cookie: string | null): Promise<void> {
  const headers: Record<string, string> = {};
  if (cookie) {
    headers['Cookie'] = cookie;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, { headers });
    const data = await response.json();
    prettyPrint(`GET ${endpoint}`, data, response.status);
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
  }
}
