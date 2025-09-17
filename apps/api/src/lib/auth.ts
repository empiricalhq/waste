import process from 'node:process';
import { betterAuth } from 'better-auth';
import { organization } from 'better-auth/plugins';
import { db } from '@/lib/db.ts';

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error('BETTER_AUTH_SECRET is required');
}

export const auth = betterAuth({
  database: db,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:4000',
  trustedOrigins: ['http://localhost:3000', 'http://localhost:8081'],
  emailAndPassword: {
    enabled: true,
    // requireEmailVerification: false,
  },
  plugins: [organization({})],
});

export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session.session;
