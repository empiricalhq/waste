import app from '@/app';
import { loadConfig } from '@/internal/config/config.ts';

const config = loadConfig();
const port = config.server.port;

export default {
  port,
  fetch: app.fetch,
};
