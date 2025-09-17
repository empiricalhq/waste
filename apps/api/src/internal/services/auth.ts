import { betterAuth } from 'better-auth';
import { organization } from 'better-auth/plugins';
import type { Config } from '@/internal/config/config';
import type { Database } from '@/internal/database/connection';

export class AuthService {
  readonly auth: ReturnType<typeof betterAuth>;

  constructor(config: Config, db: Database) {
    this.auth = betterAuth({
      database: db.getPool(),
      secret: config.auth.secret,
      baseURL: config.auth.baseURL,
      trustedOrigins: config.auth.trustedOrigins,
      emailAndPassword: {
        enabled: true,
      },
      plugins: [organization({})],
    });
  }

  get handler() {
    return this.auth.handler;
  }

  get api() {
    return this.auth.api;
  }
}

export type AuthUser = ReturnType<typeof betterAuth>['$Infer']['Session']['user'];
export type AuthSession = ReturnType<typeof betterAuth>['$Infer']['Session']['session'];
