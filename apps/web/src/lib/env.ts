// biome-ignore-all lint/style/useNamingConvention: env vars dont need to use camelCase
import { z } from 'zod';

const envSchema = z.object({
  API_BASE_URL: z.url('API_BASE_URL must be a valid URL.'),
  NEXT_PUBLIC_APP_URL: z.url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsedEnv = envSchema.safeParse({
  API_BASE_URL: process.env.API_BASE_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NODE_ENV: process.env.NODE_ENV,
});

if (!parsedEnv.success) {
  throw new Error('Invalid environment variables.');
}

export const ENV = parsedEnv.data;
