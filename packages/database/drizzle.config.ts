import process from 'node:process';
import { defineConfig } from 'drizzle-kit';

function mustEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`La variable de entorno ${name} es obligatoria`);
  }
  return value;
}

const databaseUrl = mustEnv('DATABASE_URL');

// biome-ignore lint/style/noDefaultExport: Drizzle Kit requires a default export.
export default defineConfig({
  schema: './src/schema/index.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
  strict: true,
});
