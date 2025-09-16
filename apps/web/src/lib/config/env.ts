const requiredEnvVars = ['BETTER_AUTH_URL', 'DATABASE_URL'] as const;

const _optionalEnvVars = ['NODE_ENV', 'NEXT_PUBLIC_MAPBOX_TOKEN', 'NEXT_PUBLIC_APP_URL'] as const;

export interface EnvConfig {
  // Required
  BETTER_AUTH_URL: string;
  DATABASE_URL: string;

  // Optional with defaults
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_MAPBOX_TOKEN?: string;
  NEXT_PUBLIC_APP_URL: string;
}

function validateEnv(): EnvConfig {
  const env: Partial<EnvConfig> = {};

  // Check required vars
  for (const varName of requiredEnvVars) {
    const value = process.env[varName];
    if (!value) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
    (env as any)[varName] = value;
  }

  // Set optional vars with defaults
  env.NODE_ENV = (process.env.NODE_ENV as any) || 'development';
  env.NEXT_PUBLIC_APP_URL =
    process.env.NEXT_PUBLIC_APP_URL ||
    (env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:3000');
  env.NEXT_PUBLIC_MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  return env as EnvConfig;
}

export const ENV = validateEnv();
