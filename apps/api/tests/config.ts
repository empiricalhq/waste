import process from 'node:process';

export const BASE_URL = 'http://localhost:4000/api';
export const TEST_ADMIN_EMAIL = process.env.SYSTEM_ADMIN_EMAIL || '';
export const TEST_ADMIN_PASSWORD = process.env.SYSTEM_ADMIN_PASSWORD || '';
export const TEST_DRIVER_EMAIL = 'driver@test.com';
export const TEST_DRIVER_PASSWORD = 'password123';
export const TEST_CITIZEN_EMAIL = 'citizen@test.com';
export const TEST_CITIZEN_PASSWORD = 'password123';
