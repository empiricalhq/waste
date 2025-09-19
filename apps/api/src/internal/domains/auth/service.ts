import { betterAuth } from 'better-auth';
import { admin } from 'better-auth/plugins';
import type { AppRole, appAc } from '@/internal/shared/auth/roles';
import type { Config } from '@/internal/shared/config/config';
import type { DatabaseInterface } from '@/internal/shared/database/database';

export class AuthService {
  readonly auth;

  constructor(
    config: Config,
    db: DatabaseInterface,
    accessControl: typeof appAc,
    roles: { [key in AppRole]: ReturnType<(typeof appAc)['newRole']> },
  ) {
    this.auth = betterAuth({
      database: db.getPool(),
      secret: config.auth.secret,
      baseURL: config.auth.baseURL,
      trustedOrigins: config.auth.trustedOrigins,
      emailAndPassword: {
        enabled: true,
      },
      plugins: [
        admin({
          ac: accessControl,
          roles,
          defaultRole: 'citizen',
        }),
      ],
    });
  }

  get handler() {
    return this.auth.handler;
  }

  get api() {
    return this.auth.api;
  }
}
