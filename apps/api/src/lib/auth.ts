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
  databaseHooks: {
    user: {
      create: {
        after: async (user, { input }) => {
          // Every new user gets a citizen profile by default.
          try {
            await db.query('INSERT INTO citizen_profile (user_id) VALUES ($1)', [user.id]);
          } catch (_error) {}

          // If role and organizationId are passed then add user as a member.
          // This is used by the Add User modal in the web app.
          const { role, organizationId } = (input.data || {}) as { role?: string; organizationId?: string };
          if (role && organizationId) {
            try {
              await db.query(
                'INSERT INTO member (id, user_id, organization_id, role) VALUES (gen_random_uuid(), $1, $2, $3)',
                [user.id, organizationId, role],
              );
            } catch (_error) {}
          }
        },
      },
    },
  },
});

export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session.session;
