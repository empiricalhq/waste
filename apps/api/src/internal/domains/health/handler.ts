import { Hono } from 'hono';

export function createHealthHandler(): Hono {
  const health = new Hono();

  // TODO: add a latency check to the database
  health.get('/health', (c) => {
    const now = new Date();

    return c.json({
      status: 'ok',
      timestamp: now.toISOString(),
    });
  });

  return health;
}
