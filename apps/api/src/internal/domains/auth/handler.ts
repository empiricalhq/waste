import { Hono } from 'hono';
import type { AuthService } from './service';

export function createAuthHandler(authService: AuthService): Hono {
  const auth = new Hono();

  auth.on(['POST', 'GET'], '/*', (c) => authService.handler(c.req.raw));

  return auth;
}
