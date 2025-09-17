import { Hono } from 'hono';

export function createHealthHandler(): Hono {
  const health = new Hono();

  health.get('/health', (c) => {
    return c.json({
      status: 'ok',
      timestamp: Date.now(),
    });
  });

  return health;
}
