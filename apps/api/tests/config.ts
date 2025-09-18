import type { UserConfig, UserType } from './types';

export const TEST_CONFIG = {
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:4000/api',
  defaultTimeout: 15_000,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
} as const;

export const TEST_USERS: Record<UserType, UserConfig> = {
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@test.com',
    password: 'admin-password-123',
    name: 'Test Admin',
    role: 'owner',
  },
  driver: {
    email: 'driver@test.com',
    password: 'driver-password-123',
    name: 'Test Driver',
    role: 'driver',
  },
  citizen: {
    email: 'citizen@test.com',
    password: 'citizen-password-123',
    name: 'Test Citizen',
    role: 'citizen',
  },
};
