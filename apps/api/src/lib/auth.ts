import process from 'node:process';
import { betterAuth } from 'better-auth';
import { admin } from 'better-auth/plugins';
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
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        defaultValue: 'citizen',
        input: false,
      },
    },
  },
  plugins: [
    admin({
      adminRoles: ['admin', 'supervisor'],
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (user.role === 'citizen') {
            try {
              await db.query('INSERT INTO citizen_profile (user_id) VALUES ($1)', [user.id]);
            } catch (error) {
              console.error(`Failed to create citizen_profile for user ${user.id}:`, error);
            }
          }
        },
      },
    },
  },
});

export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session.session;
