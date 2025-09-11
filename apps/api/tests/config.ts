import process from 'node:process';

export const TEST_CONFIG = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:4000/api',
  timeout: 10000,
} as const;

export const TEST_USERS = {
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@test.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'admin123456',
    name: 'Test Admin',
    role: 'admin' as const,
  },
  driver: {
    email: 'driver@test.com',
    password: 'driver123456',
    name: 'Test Driver',
    role: 'driver' as const,
  },
  citizen: {
    email: 'citizen@test.com',
    password: 'citizen123456',
    name: 'Test Citizen',
    role: 'citizen' as const,
  },
} as const;
