import app from '@/app';
import { loadConfig } from '@/internal/shared/config/config';

const config = loadConfig();
const port = config.server.port;

export default {
  port,
  fetch: app.fetch,
};
