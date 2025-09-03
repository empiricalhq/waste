import { Pool } from 'pg';
import process from 'node:process';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
