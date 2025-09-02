import { betterAuth } from 'better-auth';
import sql from '@/lib/db';

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error('BETTER_AUTH_SECRET environment variable is not set');
}

export const auth = betterAuth({
  database: sql,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:4000',
  trustedOrigins: [
    'http://localhost:3000', // apps/web (nextjs)
    'http://localhost:8081', // apps/citizen
    '*',
  ],
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: ['admin', 'supervisor', 'driver', 'citizen'],
        required: true,
        defaultValue: 'citizen',
      },
    },
  },
  telemetry: {
    enabled: false,
  },
});

export type AuthType = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
};
