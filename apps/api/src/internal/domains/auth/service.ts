import { betterAuth } from 'better-auth';
import { organization } from 'better-auth/plugins';
import type { Config } from '@/internal/shared/config/config';
import type { DatabaseInterface } from '@/internal/shared/database/database';

export class AuthService {
  readonly auth: ReturnType<typeof betterAuth>;

  constructor(config: Config, db: DatabaseInterface) {
    this.auth = betterAuth({
      database: (db as any).getPool(),
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
