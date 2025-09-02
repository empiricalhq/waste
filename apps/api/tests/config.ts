export const BASE_URL = 'http://localhost:4000/api';

export const CITIZEN_EMAIL = `citizen-${Date.now()}@test.com`;
export const CITIZEN_PASSWORD = 'password123';

// already created in the database. see packages\database\scripts\seed.ts
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

export const ENDPOINTS = {
  REGISTER: '/auth/auth/register',
  LOGIN: '/auth/auth/login',
  ADMIN_TRUCKS: '/admin/trucks',
  ADMIN_ROUTES: '/admin/routes',
  TRUCK_STATUS: '/trucks/status',
} as const;
