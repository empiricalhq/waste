import { cors } from 'hono/cors';
import type { Config } from '@/internal/config/config';

export function createCorsMiddleware(config: Config) {
  return cors({
    origin: config.server.corsOrigins,
    credentials: true,
  });
}
