import process from 'node:process';

export const BASE_URL = 'http://localhost:4000/api';
export const CITIZEN_EMAIL = `citizen-${Date.now()}@test.com`;
export const CITIZEN_PASSWORD = 'password123';
export const ADMIN_EMAIL = process.env.SYSTEM_ADMIN_EMAIL || '';
export const ADMIN_PASSWORD = process.env.SYSTEM_ADMIN_PASSWORD || '';
