import process from 'node:process';

export const TEST_CONFIG = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:4000/api',
} as const;
