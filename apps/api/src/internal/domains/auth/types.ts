import type { betterAuth } from 'better-auth';

export type AuthUser = ReturnType<typeof betterAuth>['$Infer']['Session']['user'];
export type AuthSession = ReturnType<typeof betterAuth>['$Infer']['Session']['session'];
export type SessionWithOrg = AuthSession & { activeOrganizationId?: string | null };

export type AuthEnv = {
  Variables: {
    user: AuthUser;
    session: AuthSession;
  };
};
