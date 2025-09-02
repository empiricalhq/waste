import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import {
  db,
  user,
  account,
  session,
  verification,
} from '@lima-garbage/database';

if (!process.env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is not set');
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    schema: {
      user,
      account,
      session,
      verification,
    },
    provider: 'pg',
  }),
  secret: process.env.AUTH_SECRET,
  origin: process.env.AUTH_ORIGIN || 'http://localhost:4000',

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
});
