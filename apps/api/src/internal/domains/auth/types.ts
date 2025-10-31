import type { betterAuth } from 'better-auth';

export type AuthUser = ReturnType<typeof betterAuth>['$Infer']['Session']['user'];
export type AuthSession = ReturnType<typeof betterAuth>['$Infer']['Session']['session'];

export interface AuthEnv {
  Variables: {
    user: AuthUser;
    session: AuthSession;
  };
}
