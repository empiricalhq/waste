import { drizzle } from 'drizzle-orm/postgres-js';
import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required');
}

const queryClient = postgres(process.env.DATABASE_URL);
export const db = drizzle(queryClient);

export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
