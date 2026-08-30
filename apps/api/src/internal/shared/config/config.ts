import process from 'node:process';

function mustGetEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function parseCommaSeparatedEnv(key: string, defaultValue: string): string[] {
  const value = process.env[key] || defaultValue;
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export interface DatabaseConfig {
  url: string;
  ssl: boolean;
  maxConnections: number;
  idleTimeoutMs: number;
  connectionTimeoutMs: number;
  statementTimeoutMs: number;
}

export interface AuthConfig {
  secret: string;
  baseURL: string;
  trustedOrigins: string[];
}

export interface EmailConfig {
  resendApiKey: string;
  fromEmail: string;
  fromName: string;
}

export interface ServerConfig {
  port: number;
  corsOrigins: string[];
}

export interface Config {
  database: DatabaseConfig;
  auth: AuthConfig;
  email: EmailConfig;
  server: ServerConfig;
  nodeEnv: string;
}

export function loadConfig(): Config {
  return {
    database: {
      url: mustGetEnv('DATABASE_URL'),
      ssl: process.env.NODE_ENV === 'production',
      maxConnections: 20,
      idleTimeoutMs: 30_000,
      connectionTimeoutMs: 2000,
      statementTimeoutMs: Number.parseInt(process.env.DB_STATEMENT_TIMEOUT_MS || '10000', 10),
    },
    auth: {
      secret: mustGetEnv('BETTER_AUTH_SECRET'),
      baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:4000',
      trustedOrigins: parseCommaSeparatedEnv('TRUSTED_ORIGINS', 'http://localhost:3000,http://localhost:4000'),
    },
    email: {
      resendApiKey: mustGetEnv('RESEND_API_KEY'),
      fromEmail: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      fromName: process.env.EMAIL_FROM_NAME || 'Lima Limpia',
    },
    server: {
      port: Number.parseInt(process.env.PORT || '4000', 10),
      corsOrigins: parseCommaSeparatedEnv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:4000'),
    },
    nodeEnv: process.env.NODE_ENV || 'development',
  };
}
