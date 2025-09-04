import { betterAuth } from 'better-auth';
import { db } from './db.ts';
import process from 'node:process';

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error('BETTER_AUTH_SECRET is required');
}

export const auth = betterAuth({
  database: db,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:4000/api',

  trustedOrigins: ['http://localhost:3000', 'http://localhost:8081'],

  emailAndPassword: { enabled: true },

  user: {
    additionalFields: {
      appRole: {
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

export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session.session;
