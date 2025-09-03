import { Hono } from 'hono';
import { auth } from '@/lib/auth.js';

export const authRouter = new Hono();

authRouter.on(['POST', 'GET'], '/*', (c) => {
  return auth.handler(c.req.raw);
});
