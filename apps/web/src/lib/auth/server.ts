import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { username } from 'better-auth/plugins';
import { db } from '@/db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  plugins: [username()],
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      gender: {
        type: 'string',
        required: true,
        input: true,
      },
    },
  },
});
