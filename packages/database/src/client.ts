import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import process from 'node:process';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const queryClient = postgres(process.env.DATABASE_URL);
export const db = drizzle(queryClient);
