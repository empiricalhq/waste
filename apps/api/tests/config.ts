import process from 'node:process';

export const TEST_CONFIG = {
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:4000/api',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
} as const;
